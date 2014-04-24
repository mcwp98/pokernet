from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.contrib.auth import authenticate, login
from models import UserStats
from forms import UserForm, UserStatsForm

# Create your views here.

# get the profile
def profile(request):
    return render_to_response('profile.html')
   
# register a new user 
def register(request):
    
    context = RequestContext(request)
    
    registered = False
    
    # we want to try and register a user
    if request.method == 'POST':
        
        # grab post data to user and stats forms
        user_form = UserForm(data=request.POST)
        stats_form = UserStatsForm(data = request.POST)
        
        if user_form.is_valid() and stats_form.is_valid():
        
            # save user
            user = user_form.save()
            
            # hash and save password
            user.set_password(user.password)
            user.save()
            
            # create associated user stats, commit after changes
            userstats = stats_form.save(commit=False)
            userstats.user = user
            userstats.balance = 100
            
            if 'picture' in request.FILES:
                userstats.picture = request.FILES['picture']
            
            userstats.save()
            
            # we did it!
            registered = True
            
        # invalid form(s)
        else:
            print user_form.errors, profile_form.errors
            
    # not a POST, so just render the form
    else:
        user_form = UserForm()
        stats_form = UserStatsForm()
        
    # render template depending on context
    return render_to_response(
        'register.html',
        {'user_form': user_form, 'stats_form': stats_form, 'registered': registered},
        context)
        
# user login
def user_login(request):
    
    context = RequestContext(request)
    
    # theyre attempting to log in
    if request.method == 'POST':
    
        username = request.POST['username']
        password = request.POST['password']
        
        user = authenticate(username=username, password=password)
        
        # we've got a user
        if user is not None:
        
            # is the account active (not banned)
            if user.is_active:
            
                login(request, user)
                return HttpResponseRedirect('/users/')
            
            else:
                return HttpResponse("Your account is disabled")
            
        else:
            return HttpResponse("Invalid login details")
            
    # not post, so show form
    else:
        return render_to_response('login.html',{}, context)
             
            
