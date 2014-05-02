from django.conf.urls import patterns, include, url

urlpatterns = patterns('',

    url(r'^$', 'users.views.profile', name='profile'),
    url(r'^register/$', 'users.views.register', name='register'),
    url(r'^login/$', 'users.views.user_login', name='login'),
    url(r'^logout/$', 'users.views.user_logout', name='login'),
)
