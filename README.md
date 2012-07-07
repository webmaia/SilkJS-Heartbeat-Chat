<h1> Silk JS - Heartbeat Chat, Using short-polling and combining ajax requests and callbacks to provide</h1><hr />
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