from django.shortcuts import render,get_object_or_404
from django.contrib.auth import authenticate
from .models import *

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from datetime import timedelta
from django.utils import timezone  
from django.http import HttpResponse

from django.core.files.base import ContentFile
import json 
import random
from django.http import JsonResponse
from django.utils.timezone import now

from google import genai
from google.genai import types

from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("API_KEY")  # replace with your api keys


client = genai.Client(
    api_key=api_key
)

model = "gemini-2.0-flash"


# FASTAPI_URL = "http://localhost:8010/detect_leaf_disease/" 

FASTAPI_URL='https://leafcareapi.onrender.com/detect_leaf_disease/'

def index(request):
    return render(request, "index.html")  



@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        data=json.loads(request.body)
        username=data.get("username")
        email=data.get("email")
        password=data.get("password")
        print(data)
        if User.objects.filter(username=username).exists():
            return Response({'success':False,"message": "Username already taken"}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'success':False,"message": "Email already registered"}, status=400)
        username=username.trim()
        email=email.trim()
        password=password.trim()
        user = User.objects.create_user(username=username, email=email, password=password)
        otp=send_otp_email(user)
        print(data,otp)
        OTPVerification.objects.create(user=user,otp=otp,expires_at=datetime.now() + timedelta(minutes=10))
        return Response({'success':True,'message':f'User registered successfully. OTP sent to {email}'})
    else:
        return Response({'success':False,'message':'Only POST method is allowed'})
    

def send_otp_email(user):
    otp = random.randint(100000, 999999)
    print(otp)
    # Prepare the email content
    context = {
        "name": user.username,
        "otp": otp
    }
    html_message = render_to_string("otp_email_template.html", context)
    subject = "Your OTP Verification"
    from_email = "teamnoneofficial@gmail.com"
    recipient_list = [user.email]

    # Send the email
    msg = EmailMultiAlternatives(subject, "Please enable HTML to view this email.", from_email, recipient_list)
    msg.attach_alternative(html_message, "text/html")
    msg.send()
    return otp
    

@api_view(['POST'])
def verify_otp(request):
    """
    Verify the OTP entered by the user.
    """
    data = json.loads(request.body)
    username = data.get("username")
    otp_entered = data.get("otp")
    print(username,otp_entered)
    if not username or not otp_entered:
        return Response({'success': False, 'message': 'Username and OTP are required'}, status=400)
    try:
        user = User.objects.get(username=username)
        otp_entry = OTPVerification.objects.filter(user=user, is_verified=False).latest('created_at')
        if otp_entry.expires_at < now():
            return Response({'success': False, 'message': 'OTP has expired, click Resend.'}, status=400)
        if otp_entry.otp == otp_entered:
            otp_entry.is_verified = True
            otp_entry.save()
            user.is_verified = True
            user.save()
            return Response({'success': True, 'message': 'OTP verified successfully'})
        else:
            return Response({'success': False, 'message': 'Invalid OTP,Try again.'}, status=400)

    except User.DoesNotExist:
        return Response({'success': False, 'message': 'User not found'}, status=404)

    except OTPVerification.DoesNotExist:
        return Response({'success': False, 'message': 'No OTP found for this user, click Resend.'}, status=400)



@api_view(['POST'])
def resend_otp(request):
    """
    Resend OTP to the user if the last OTP was sent more than 1 minute ago.
    """
    data = json.loads(request.body)
    username = data.get("username")
    if not username:
        return Response({'success': False, 'message': 'Username is required'}, status=400)
    try:
        user = User.objects.get(username=username)
        otp_entry = OTPVerification.objects.filter(user=user).latest('created_at')

        if otp_entry.created_at > timezone.now() - timedelta(minutes=1):
            return Response({'success': False, 'message': 'Please wait at least 1 minute before requesting a new OTP.'}, status=400)
        
        new_otp = send_otp_email(user)  

        OTPVerification.objects.create(user=user, otp=new_otp, expires_at=timezone.now() + timedelta(minutes=5))
        print(f"New OTP for {username}: {new_otp}")
        return Response({'success': True, 'message': 'A new OTP has been sent successfully.'})
    
    except User.DoesNotExist:
        return Response({'success': False, 'message': 'User not found'}, status=404)

    except OTPVerification.DoesNotExist:
        new_otp = random.randint(100000, 999999)
        OTPVerification.objects.create(user=user, otp=new_otp, expires_at=timezone.now() + timedelta(minutes=5))
        print(f"New OTP for {username}: {new_otp}")
        return Response({'success': True, 'message': 'A new OTP has been sent successfully.'})

@api_view(['GET'])
def is_logged_in(request):
    """
    Check if the user is authenticated and return user details.
    """
    if request.user.is_authenticated:
        return Response({
            "success": True,
            "id": request.user.id,
            "name": request.user.username,
            "email": request.user.email
        })
    
    return Response({"success": False, "message": "User not authenticated"}, status=401)

@api_view(['POST'])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    
    if not username or not password:
        return Response({'success':False,"error": "Username and password are required"})
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'success':False,"error": "Username does not exist"})
    
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'success':False,"error": "Incorrect password"})
    
    refresh = RefreshToken.for_user(user)  # Generate JWT tokens
    return Response({
        'success':True,
        "id": user.id,
        'is_verified':user.is_verified,
        "username": user.username,
        "email": user.email,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
import requests
from django.db import transaction

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    user = request.user
    return Response({
        "isAuthenticated": True,
        "id": user.id,
        "username": user.username,
        "email": user.email,
        'is_verified': user.is_verified,
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_leaf_disease(request):
    """Django API: Calls FastAPI for leaf disease detection and stores image in the database."""
    try:
        user = request.user
        if 'image' not in request.FILES:
            return Response({'message': 'No image file provided', 'success': False}, status=400)
        image = request.FILES['image']
        image_content = image.read()
        image_name = image.name  
        if image.content_type not in ['image/jpeg', 'image/jpg', 'image/png']:
            return Response({'message': 'Invalid image format. Use JPG, JPEG, or PNG.', 'success': False}, status=400)
        files = {'file': (image_name, image_content, image.content_type)}
        fastapi_response = requests.post(FASTAPI_URL, files=files, timeout=10)

        if fastapi_response.status_code != 200:
            return Response({'message': 'FastAPI request failed', 'success': False}, status=500)

        fastapi_data = fastapi_response.json()
        with transaction.atomic():
            prediction_entry = Predictions.objects.create(
                user=user,
                image=image_content,  # Store binary image data
                prediction=fastapi_data.get('disease_name', 'Unknown'),
                confidence=float(fastapi_data.get('confidence', 100)),
                jsondata=fastapi_data
            )

        return Response(fastapi_data, status=200)

    except Exception as e:
        return Response({'message': 'Error processing image', 'error': str(e), 'success': False}, status=500)

from django.core.files.base import ContentFile

def update_database(user, image_content, image_name, detection_data):
    """
    Function to update the database asynchronously.
    Ensures the image is saved correctly without corruption.
    """
    try:
        with transaction.atomic(): 
            prediction_entry = Predictions.objects.create(
                user=user,
                prediction=detection_data.get('disease_name', 'Unknown'),
                confidence=float(detection_data.get('confidence', 100)),
                jsondata=detection_data  
            )
            prediction_entry.image.save(image_name, ContentFile(image_content), save=True)
            # print("✅ Database updated successfully!")

    except Exception as e:
        print(f"❌ Error updating database: {e}")




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_chat_session(request):
    """Creates a new chat session linked to the latest prediction."""
    user = request.user

    prediction = Predictions.objects.filter(user=user).order_by('-timestamp').first()
    if not prediction:
        return Response({'message': 'No prediction found. Upload an image first.', 'success': False}, status=400)

    chat_session = ChatSession.objects.create(session_name=prediction.prediction,user=user, prediction=prediction)

    return Response({
        'success': True,
        'session_id': chat_session.id,
        'message': 'Chat session created successfully'
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, session_id):
    """Fetches messages for a given chat session and ensures AI messages exist"""
    chat_session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    messages = chat_session.messages.all().order_by("timestamp")

    if not messages.exists():
        prediction = chat_session.prediction  

        predefined_messages = [
            AIMessage(session=chat_session, sender='bot', message="Hello, this is Leafcare AI."),
            AIMessage(session=chat_session, sender='bot', message=f"Prediction: {prediction.prediction}")
        ]
        AIMessage.objects.bulk_create(predefined_messages)  # Creates both messages in a single DB query

        print(f"Predefined messages created for session {session_id} with prediction: {prediction.prediction}")

        messages = chat_session.messages.all().order_by("timestamp")

    messages_data = []
    for msg in messages:
        image_url = None

        if msg.sender == "bot" and msg.message.startswith("Prediction") and chat_session.prediction.image:
            image_url = f"https://leafcareai.vercel.app/backend/get_prediction_image/{chat_session.prediction.id}/"

        messages_data.append({
            "id": msg.id,
            "sender": msg.sender,
            "content": msg.message,
            "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "image": image_url  # Attach image URL only when relevant
        })

    return Response({"messages": messages_data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Handles user messages, sends them to Gemini AI, and stores responses."""
    data = request.data
    session_id = data.get("session_id")
    user_message = data.get("message")
    chat_session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    AIMessage.objects.create(session=chat_session, sender="user", message=user_message)
    previous_messages = AIMessage.objects.filter(session=chat_session).order_by("timestamp")

    chat_history = [
    types.Content(
        role="user",
        parts=[types.Part.from_text(text=msg.message)]
    ) if msg.sender == "user" else types.Content(
        role="model",
        parts=[types.Part.from_text(text=msg.message)]
    )
    for msg in previous_messages
]

    chat_history = [
    types.Content(role="user", parts=[types.Part.from_text(text=f"The disease we are discussing is **{chat_session.prediction.prediction}**.")]),
    types.Content(role="model", parts=[types.Part.from_text(text=f"Okay, {chat_session.prediction.prediction}. Let's get to it. What do you want to know? Symptoms? Causes? Treatment? Hit me with your questions!")])
    ] + chat_history[2:]
    chat_history.append(
            types.Content(role="user", parts=[types.Part.from_text(text=user_message)])
        )
    generate_content_config = types.GenerateContentConfig(temperature=2,
        top_p=0.95,
        top_k=40,
        max_output_tokens=1024,
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""This chat is for a **Leaf Disease Detection Application**.
            - Your name is **LeafCare AI**, and you should act like a **person** when responding.  
            - You were developed by **Gnaneswararao Polaki**.  
            - If the user **specifically asks for the developer's name**, respond with: **\"LeafCare AI was developed by Gnaneswararao Polaki.\"**  
            - Otherwise, **do not mention the developer name jsut as as i am LeafCare AI.**  
            - Provide information **only about plant diseases as well as the leaf**.  
            - Focus on **Symptoms, Causes, Treatment (Natural & Chemical), Pesticides & Prices, and Helpful Websites**.  
            - Keep answers **concise unless the user requests more details**.  
            - If the question is **unrelated to plant diseases or  leafs or leaf diseases**, respond with: **\"I do not have more knowledge about this topic.\"**  
            - If the user types **casual or filler words** (such as \"hmm,\" \"haa,\" \"huh,\" \"hii,\" \"ok,\" \"thanks,\" \"sure,\" etc.), **respond naturally, like a person with common sense**, rather than giving robotic replies.
            - The chat **will always start with the name of a plant leaf disease** as the first message.  
            - **Do not respond to this initial message.**  
            - Only respond after the user sends a follow-up message.
            """),
        ],
    )

    response = client.models.generate_content(model=model,
    contents=chat_history,config=generate_content_config,
   )
    # print(chat_history)
    ai_response_text = response.text if response and response.text else "I'm not sure how to respond."
    ai_message = AIMessage.objects.create(session=chat_session, sender="bot", message=ai_response_text)

    return JsonResponse({
        "user_message": {
            "id": user_message,
            "sender": "user",
            "content": user_message,
        },
        "ai_message": {
            "id": ai_message.id,
            "sender": "bot", 
            "content": ai_message.message,
        },
    })




@api_view(['GET'])
def get_prediction_image(request, prediction_id):
    """Retrieve stored image from the database"""
    try:
        prediction = Predictions.objects.get(id=prediction_id)
        if not prediction.image:
            return Response({'message': 'No image found', 'success': False}, status=404)
        print('no')
        return HttpResponse(prediction.image, content_type="image/jpeg")
       
    except Predictions.DoesNotExist:
        print('not')
        return Response({'message': 'Prediction not found', 'success': False}, status=404)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_sessions(request):
    """Fetches all chat sessions for the logged-in user."""
    chat_sessions = ChatSession.objects.filter(user=request.user).order_by('-created_at')
    print(chat_sessions[0].session_name)
    sessions_data = [
        {
            "id": session.id,
            "session_name": session.session_name,
            "created_at": session.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for session in chat_sessions
    ]

    return JsonResponse({"sessions": sessions_data}, safe=False)