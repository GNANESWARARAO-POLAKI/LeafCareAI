from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime,timedelta
import random

class User(AbstractUser):
    email=models.EmailField(unique=True)
    is_verified=models.BooleanField(default=False)
    def __str__(self):          
        return f"{self.username} ({'Verified' if self.is_verified else 'Unverified'})"
    

# class Predictions(models.Model):
#     user=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True)
#     image = models.ImageField(upload_to="leaf_images/")
#     prediction = models.CharField(max_length=255, null=True, blank=True)
#     confidence = models.FloatField(null=True, blank=True,default=100)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     jsondata=models.JSONField(null=True,blank=True)

#     def __str__(self):
#         return f'Prediction to image {self.image}  as {self.prediction}'

class Predictions(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    image = models.BinaryField(null=True, blank=True)  # Store the image as binary data
    prediction = models.CharField(max_length=255, null=True, blank=True)
    confidence = models.FloatField(null=True, blank=True, default=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    jsondata = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f'Prediction to image {self.id} as {self.prediction}'


class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_sessions")
    session_name = models.CharField(max_length=255, default="New Chat")  # Optional: Name for session
    prediction=models.ForeignKey(Predictions,on_delete=models.CASCADE,related_name='chat_on_pridiction')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatSession {self.id} - {self.user.username} ({self.created_at})"
    
class AIMessage(models.Model):
    session=models.ForeignKey(ChatSession,on_delete=models.CASCADE,related_name='messages')
    sender=models.CharField(max_length=10,choices=[('user','User'),('ai','AI')])
    message=models.TextField()
    timestamp=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'Message form {self.sender} at {self.timestamp}'



class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otp_codes")
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = datetime.now() + timedelta(minutes=5)  # OTP expires in 5 minutes
        super().save(*args, **kwargs)

    def __str__(self):
        return f"OTP for {self.user.username} - {'Verified' if self.is_verified else 'Pending'}"

    @classmethod
    def generate_otp(cls, user):
        """Generate and store a new OTP for the user."""
        otp = random.randint(100000, 999999)  # Generate 6-digit OTP
        otp_entry = cls.objects.create(
            user=user,
            otp=str(otp),
            expires_at=datetime.now() + timedelta(minutes=5)  # Expiry time
        )
        return otp

