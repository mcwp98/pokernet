from django.db import models
from django.contrib.auth.models import User # to extend the basic user

# Create your models here.

class UserStats(models.Model):
    # link to user model
    user = models.OneToOneField(User)
    balance = models.FloatField()
    picture = models.ImageField(upload_to='uploaded_files', blank=True)
    
    # Override unicode method
    def __unicode__(self):
        return self.user.username
        
    def changeBalance(self, change):
        newVal = self.balance + change
        if (newVal <= 0):
            newVal = 0
        self.balance = newVal
        return newVal
            
