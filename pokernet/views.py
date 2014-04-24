from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.template import RequestContext

def home(request):
	args = RequestContext(request)
	return render_to_response('index.html', args)
	
def help(request):
	args = RequestContext(request)
	return render_to_response('help.html', args)
	