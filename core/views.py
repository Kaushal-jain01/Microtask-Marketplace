from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,  AllowAny
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer, RegisterSerializer

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    # permission_classes = [IsAuthenticated]

    # List = public (students browse), Create = authenticated (business posts)
    def get_permissions(self):
        if self.request.method == 'GET':  # Browsing
            return [AllowAny()]
        return [IsAuthenticated()]  # Posting
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)  # Auto-set poster

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    queryset = Task.objects.all()

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            role = request.data['profile']['role']
            return Response({
                "message": f"User registered as {role.title()}!",
                "username": user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

