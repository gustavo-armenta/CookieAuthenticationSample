using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using CSharpClient;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using PhoneClient.Resources;

namespace PhoneClient
{
    public partial class MainPage : PhoneApplicationPage
    {
        // Constructor
        public MainPage()
        {
            InitializeComponent();

            var writer = new TextBlockWriter(SynchronizationContext.Current, this.Messages);
            var client = new CommonClient(writer);

            // Windows Phone emulator runs in a separate virtual machine therefore you can't use a url containing localhost
            var task = client.RunAsync("http://signalr-test1.cloudapp.net:83/");

            // Sample code to localize the ApplicationBar
            //BuildLocalizedApplicationBar();
        }

        // Sample code for building a localized ApplicationBar
        //private void BuildLocalizedApplicationBar()
        //{
        //    // Set the page's ApplicationBar to a new instance of ApplicationBar.
        //    ApplicationBar = new ApplicationBar();

        //    // Create a new button and set the text value to the localized string from AppResources.
        //    ApplicationBarIconButton appBarButton = new ApplicationBarIconButton(new Uri("/Assets/AppBar/appbar.add.rest.png", UriKind.Relative));
        //    appBarButton.Text = AppResources.AppBarButtonText;
        //    ApplicationBar.Buttons.Add(appBarButton);

        //    // Create a new menu item with the localized string from AppResources.
        //    ApplicationBarMenuItem appBarMenuItem = new ApplicationBarMenuItem(AppResources.AppBarMenuItemText);
        //    ApplicationBar.MenuItems.Add(appBarMenuItem);
        //}
    }
}