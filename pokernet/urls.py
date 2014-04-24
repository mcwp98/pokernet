from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'pokernet.views.home', name='home'),
    url(r'^help/', 'pokernet.views.help', name='help'),
    (r'^users/', include('users.urls')),
    (r'^tables/', include('tables.urls')),
    url(r'^admin/', include(admin.site.urls)),
)

