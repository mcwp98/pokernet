from django.shortcuts import render_to_response
from django.http import HttpResponse
from models import Table

# Create your views here.

# display tables on home page
def tables(request):
    
    args = {}
    args['tables'] = Table.objects.all()
    
    return render_to_response('tables.html', args)
    
# join a table
def joinTable(request, tableID=1):
    # table = Table.objects.get(id=tableID)
    
    args = {}
    # args['table'] = table
    
    return render_to_response('game.html', args)

def createTable(request):
	args = {}
	return render_to_response('game.html', args)
	