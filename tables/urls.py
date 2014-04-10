from django.conf.urls import patterns, include, url

urlpatterns = patterns(''

    , url(r'^(?P<tableID>\d+)/$', 'tables.views.joinTable')
    , url(r'^$', 'tables.views.tables')
    , 
)
