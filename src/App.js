import React, { Component } from 'react';
import './App.css';
import { Tabs, Tab } from 'material-ui-prev/Tabs';
import MuiThemeProvider from 'material-ui-prev/styles/MuiThemeProvider'
import FlightSearchForm from './flight-search-form/flight-search-form';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            slideIndex: 0,
        };
    }

    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <Tabs>
                        <Tab label="Flight search">
                            <div className="main-wrapper">
                                <FlightSearchForm />
                            </div>
                        </Tab>
                    </Tabs>
                </MuiThemeProvider>
            </div>
        );
    }
}

export default App;
