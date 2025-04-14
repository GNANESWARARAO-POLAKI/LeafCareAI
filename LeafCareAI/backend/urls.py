from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns=[
    path('register/',views.register,name='register'),
    path('login/',views.login_view,name='login'),
    path('verify_otp/',views.verify_otp,name='verify_otp'), 
    path('resend_otp/',views.resend_otp,name='resend_otp'),
     path('is_logged_in',views.is_logged_in,name='is_logged_in'),
     path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
      path("check_auth/", views.check_auth, name="check_auth"),
    path('detect_leaf/',views.detect_leaf_disease,name='detect_leaf'),
      path("start_chat_session/", views.start_chat_session, name="start_chat_session"),
    path("get_chat_messages/<int:session_id>/", views.get_chat_messages, name="get_chat_messages"),
    path("send_message/", views.send_message, name="send_message"),
    path('get_prediction_image/<int:prediction_id>/',views.get_prediction_image,name='prediction_image'),
    path('get_chats/',views.get_chat_sessions,name='get_chats'),
]