from django.shortcuts import render_to_response, render
from django.http import HttpResponse
from models import Table, NewTableForm

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

def newtable(request):
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
    
    
    