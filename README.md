<h1> Silk JS - Heartbeat Chat, Using short-polling and combining ajax requests and callbacks to provide</h1><hr />
<h2>Interest</h2>
<p>If there is interest I will spend some time and make the program more customizable otherwise I won't waste my time,
so just let me know</p>
<h2>Issues</h2>
<p>There is an issue with the messaging system front end where if you were to set it to update every 2 seconds it would
limit the user to only 1 message for that duration. Ideally it would be customizable in that the user would have their
messages for those two seconds merged into on this reduces the amount of DB records and write the server has to do
while still meeting the real time like effect. Since my default of 500ms is so fast I can use it to throttle the users
ability to spam.</p>
<h2>Dependencies</h2>
  <ul>
    <li>jQuery/jQuery UI</li>
    <li>Twitter Bootstrap Buttons</li>
    <li>jQWidgets Tabs</li>
    <li>Chosen Dropdown</li>
    <li>Noty Notifications</li>
  </ul>
      
<h2>Setup</h2>
<p>It is currently setup for use with SilkJS by using the heartbeat.sjs file. Of course it would work with any back
that can execute the commands given the data in the post.

<hr />
<ul>
  <h2><strong>TODO:</strong></h2>
  <li>ASAP: Add a message que or tell users there are limits on how fast they can send messages and that the current one 
  will not be proccessed</li>
  <li>Add notification system for unread messages as well as for when someone sends you a message you haven't looked at.</li>
  <li>Add finished callback so methods with a large amount of beats can execute callback when they finish so they
  can start up again with new parameters</li>
</ul>