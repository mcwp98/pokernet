from django.db import models
from django import forms

# Table Model
class Table(models.Model):

    currentUsers = models.IntegerField()
    tableLimit = models.FloatField()
    tableBlind = models.FloatField()
    
    def __unicode__(self):
        return self.tableType
    
    # set number of users
    def changeUsers(self, change):
        newVal = currentUsers + change
        
        # don' change max size
        if (newVal > 10 or newVal < 1):
            return -1
        else:
            self.currentUsers = newVal
            self.save()
        return newVal
        
    # close table functions
    def closeTable(self):
        self.currentUsers = 0
        return

# Form for creating new talbles
class NewTableForm(forms.Form):
	tableLimit = forms.FloatField()
	tableBlind = forms.FloatField()
