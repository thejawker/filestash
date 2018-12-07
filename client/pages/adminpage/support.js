import React from 'react';
import { Redirect } from 'react-router-dom';

export class SupportPage extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
              <h2>Support</h2>
              <p>
                Enterprise support is available upon request, <a href="mailto:mickael@kerjean.me">contact us</a>.
              </p>
              <p>
                There's also a community chat available on Freenode at #filestash (click  <a href="https://kiwiirc.com/nextclient/#irc://irc.freenode.net/#filestash?nick=guest??">here</a> if you're not an IRC guru). Feel free to
                come and chat with us.
              </p>
              <h2>Quick Links</h2>
              <ul>
                <li><a href="https://www.filestash.app/support#faq">FAQ</a></li>
                <li><a href="https://www.filestash.app/docs">Documentation</a></li>
                <li><a href="https://www.filestash.app/">Our website</a></li>
              </ul>
            </div>
        );
    }
}
