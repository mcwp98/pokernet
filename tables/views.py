from django.shortcuts import render_to_response, render, redirect
from django.http import HttpResponse
from models import Table, NewTableForm
from django.contrib.auth import authenticate, login
<<<<<<< HEAD
=======
from django.core.context_processors import csrf
>>>>>>> ff112945a2d782afbd8f729608cc71c783826c31

# Create your views here.

# display tables on home page
def tables(request):
	if not request.user.is_authenticated():
		return redirect('/users/login/')
<<<<<<< HEAD
=======

>>>>>>> ff112945a2d782afbd8f729608cc71c783826c31
	args = {}
	args['tables'] = Table.objects.all()
	
	return render_to_response('tables.html', args)
    
# join a table
def joinTable(request, tableID=1):
<<<<<<< HEAD
=======

    # make sure were authenticated
>>>>>>> ff112945a2d782afbd8f729608cc71c783826c31
	if not request.user.is_authenticated():
		return redirect('/users/login/')
	table = Table.objects.get(id=tableID)
	table.currentUsers = table.currentUsers +1
	table.save()
	
<<<<<<< HEAD
	args = {}
	args['tables'] = table
=======
	current_user = request.user
	
	args = {}
	
	args['table'] = table.id
	args['username'] = current_user.username
	args['id'] = current_user.id
>>>>>>> 619a3f82de21e3d4503661159ff84287cc5e3036
	# args['table'] = table
	
	return render_to_response('game.html', args)

def newtable(request):

	if not request.user.is_authenticated():
		return redirect('/users/login/')
<<<<<<< HEAD
=======
	if request.method == 'POST': # If the form has been submitted...
		# ContactForm was defined in the the previous section
		form = NewTableForm(request.POST) # A form bound to the POST data
		if form.is_valid(): # All validation rules pass
			# Process the data in form.cleaned_data
			# ...
			
			newTableEntry = Table(currentUsers=1, tableLimit=form.cleaned_data['tableLimit'], tableBlind=form.cleaned_data['tableBlind'] )
			newTableEntry.save()
			args = {}
			return redirect('/tables/' + str(newTableEntry.id))
	else:
		form = NewTableForm() # An unbound form
	
	return render(request, 'createTable.html', {
		'form': form,
	})
    
    
<<<<<<< HEAD
<<<<<<< HEAD
    return render_to_response('game.html', args)

def newtable(request):
>>>>>>> ff112945a2d782afbd8f729608cc71c783826c31
	if request.method == 'POST': # If the form has been submitted...
		# ContactForm was defined in the the previous section
		form = NewTableForm(request.POST) # A form bound to the POST data
		if form.is_valid(): # All validation rules pass
			# Process the data in form.cleaned_data
			# ...
			
			newTableEntry = Table(currentUsers=1, tableLimit=form.cleaned_data['tableLimit'], tableBlind=form.cleaned_data['tableBlind'] )
			newTableEntry.save()
			args = {}
			return render_to_response('game.html', args)
	else:
		form = NewTableForm() # An unbound form
	
	return render(request, 'createTable.html', {
		'form': form,
	})
    
    
=======
>>>>>>> c613c48e69cce16d3bd33566b7cae63b44908b38
    
=======
    
>>>>>>> 619a3f82de21e3d4503661159ff84287cc5e3036
