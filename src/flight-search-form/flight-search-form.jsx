import React from 'react';
import './flight-search-form.css';
import AutoComplete from 'material-ui-prev/AutoComplete';
import RaisedButton from 'material-ui-prev/RaisedButton';
import Snackbar from 'material-ui-prev/Snackbar';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import CircularProgress from 'material-ui-prev/CircularProgress';

import Dialog from 'material-ui-prev/Dialog';
import SelectField from 'material-ui-prev/SelectField';
import MenuItem from 'material-ui-prev/MenuItem';
import FlatButton from 'material-ui-prev/FlatButton';

import FlightMap from '../map/map';
import FlightTable from '../flight-table/flight-table';

import openSocket from 'socket.io-client';
import deepEqual from 'deep-equal';

import airports from '../data/airports.json';
import airlines from '../data/airlines.json';

const namespace = '/main';
//const socket = openSocket('https://flight-finder-server.herokuapp.com' + namespace);
const socket = openSocket('http://localhost:17995' + namespace);

const menuProps = {
    desktop: true,
    disableAutoFocus: true,
};

class FlightSearchForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            airportFrom: '',
            airportTo: '',
            snackbarInvalidAirportOpen: false,
            snackbarInvalidAirportText: '',
            snackbarServerErrorOpen: false,
            preferencesOpen: false,
            loadingOpen: false,

            lastRequestData: {},

            numberOfRoutesValue: 1,

            airportQueueingPref: 3,
            airportTerminalCleanlinessPref: 3,
            airportTerminalSeatingPref: 3,
            airportTerminalSignsPref: 3,
            airportFoodPref: 3,
            airportShoppingPref: 3,
            airportWifiConnectivityPref: 3,
            airportAirportStaffPref: 3,
            airportUserRecommendationPref: 3,

            airlineSeatComfortPref: 3,
            airlineCabinStaffPref: 3,
            airlineFoodPref: 3,
            airlineEntertainmentPref: 3,
            airlineGroundServicePref: 3,
            airlineWifiConnectivityPref: 3,
            airlineValueMoneyPref: 3,
            airlineUserRecommendationPref: 3
        };

        socket.on('routes_reply', data => {
            let flightData = JSON.parse(data.flights);
            console.log(flightData);
            this.handleLoadingClose();

            let flights = [];
            let numberOfFlights = flightData.airports_list.length;
            for (let i = 0; i < numberOfFlights; i++) {
                let flightLegs = [];
                let coordinates = [];

                for (let j = 0; j < flightData.airports_list[i].length - 1; j++) {
                    let airportFrom = airports.find(a => a.id === flightData.airports_list[i][j]);
                    let airportTo = airports.find(a => a.id === flightData.airports_list[i][j + 1]);
                    let airline = airlines.find(a => a.id === flightData.airline_list[i][j]);

                    coordinates.push({
                        lat: parseFloat(airportFrom.latitude),
                        lng: parseFloat(airportFrom.longitude)
                    });

                    flightLegs.push({
                        from: airportFrom === undefined ? flightData.airports_list[i][j] : airportFrom.text,
                        to: airportTo === undefined ? flightData.airports_list[i][j + 1] : airportTo.text,
                        airline: airline === undefined ? flightData.airline_list[i][j] : airline.name
                    });
                }

                let destinationAirport = airports.find(a => a.text === this.state.airportTo);
                coordinates.push({
                    lat: parseFloat(destinationAirport.latitude),
                    lng: parseFloat(destinationAirport.longitude)
                })

                flights.push({
                    from: this.state.airportFrom,
                    to: this.state.airportTo,
                    stops: flightData.airports_list[i].length - 2,
                    weight: flightData.weigh_list[i],
                    legs: flightLegs,
                    coordinates: coordinates
                });
            }
            
            if ((Object.keys(this.state.lastRequestData).length === 0 && this.state.lastRequestData.constructor === Object) || deepEqual(this.state.lastRequestData, data.requestData))
                this.tableChild.updateFlights(flights);
        });

        socket.on('error_reply', (data) => {
            this.handleLoadingClose();
            console.log(data);
            this.openInvalidServerErrorSnackbar();
        });

        this.handleRequestCloseAirportSnackbar = this.handleRequestCloseAirportSnackbar.bind(this);
        this.handleRequestCloseServerErrorSnackbar = this.handleRequestCloseServerErrorSnackbar.bind(this);
        this.onNewRequestFrom = this.onNewRequestFrom.bind(this);
        this.onNewRequestTo = this.onNewRequestTo.bind(this);
        this.findFlights = this.findFlights.bind(this);
        this.openInvalidAirportSnackbar = this.openInvalidAirportSnackbar.bind(this);
        this.onFlightSelected = this.onFlightSelected.bind(this);
        this.handlePreferencesOpen = this.handlePreferencesOpen.bind(this);
        this.handlePreferencesClose = this.handlePreferencesClose.bind(this);
        this.handleLoadingOpen = this.handleLoadingOpen.bind(this);
        this.handleLoadingClose = this.handleLoadingClose.bind(this);
    }

    convertSelectFieldValueToWeight = (value) => {
        switch (value) {
            case 1: return 9;
            case 2: return 7;
            case 3: return 5;
            case 4: return 3;
            case 5: return 1;
            default: return 5;
        }
    }

    convertSelectFieldValueToNumberOfRoutes = (value) => {
        switch (value) {
            case 1: return 1;
            case 2: return 5;
            case 3: return 10;
            case 4: return 15;
            case 5: return 20;
            default: return 5;
        }
    }

    handleNumberOfRoutesValue = (event, index, value) => {
        this.setState({ numberOfRoutesValue: value });
    }

    //airportPrefHandlers
    handleAirportQueueingPref = (event, index, value) => {
        this.setState({ airportQueueingPref: value });
    }

    handleAirportTerminalCleanlinessPref = (event, index, value) => {
        this.setState({ airportTerminalCleanlinessPref: value });
    }

    handleAirportTerminalSeatingPref = (event, index, value) => {
        this.setState({ airportTerminalSeatingPref: value });
    }

    handleAirportTerminalSignsPref = (event, index, value) => {
        this.setState({ airportTerminalSignsPref: value });
    }

    handleAirportFoodPref = (event, index, value) => {
        this.setState({ airportFoodPref: value });
    }

    handleAirportShoppingPref = (event, index, value) => {
        this.setState({ airportShoppingPref: value });
    }

    handleAirportWifiConnectivityPref = (event, index, value) => {
        this.setState({ airportWifiConnectivityPref: value });
    }

    handleAirportStaffPref = (event, index, value) => {
        this.setState({ airportAirportStaffPref: value });
    }

    handleAirportUserRecommendationPref = (event, index, value) => {
        this.setState({ airportUserRecommendationPref: value });
    }

    handlePreferencesOpen = () => {
        this.setState({ preferencesOpen: true });
    };

    handlePreferencesClose = () => {
        this.setState({ preferencesOpen: false });
    };

    handleLoadingOpen = () => {
        this.setState({ loadingOpen: true });
    };

    handleLoadingClose = () => {
        this.setState({ loadingOpen: false });
    };

    //airlinePrefHandlers
    handleAirlineSeatComfortPref = (event, index, value) => {
        this.setState({ airlineSeatComfortPref: value });
    }

    handleAirlineCabinStaffPref = (event, index, value) => {
        this.setState({ airlineCabinStaffPref: value });
    }

    handleAirlineFoodPref = (event, index, value) => {
        this.setState({ airlineFoodPref: value });
    }

    handleAirlineEntertainmentPref = (event, index, value) => {
        this.setState({ airlineEntertainmentPref: value });
    }

    handleAirlineGroundServicePref = (event, index, value) => {
        this.setState({ airlineGroundServicePref: value });
    }

    handleAirlineWifiConnectivityPref = (event, index, value) => {
        this.setState({ airlineWifiConnectivityPref: value });
    }

    handleAirlineValueMoneyPref = (event, index, value) => {
        this.setState({ airportAirlineValueMoneyPref: value });
    }

    handleAirlineUserRecommendationPref = (event, index, value) => {
        this.setState({ airlineUserRecommendationPref: value });
    }

    openInvalidAirportSnackbar = (text) => {
        this.setState({
            snackbarInvalidAirportText: text,
            snackbarInvalidAirportOpen: true
        });
    }

    handleRequestCloseAirportSnackbar = () => {
        this.setState({ snackbarInvalidAirportOpen: false });
    };

    openInvalidServerErrorSnackbar = () => {
        this.setState({ snackbarServerErrorOpen: true });
    }

    handleRequestCloseServerErrorSnackbar = () => {
        this.setState({
            snackbarServerErrorOpen: false,
        });
    }

    onNewRequestFrom(chosenRequest, index) {
        if (airports.map(a => a.text).indexOf(chosenRequest) !== -1) {
            this.setState({ airportFrom: chosenRequest });
        } else {
            this.openInvalidAirportSnackbar('Invalid departure airport.');
        }
    }

    onNewRequestTo(chosenRequest, index) {
        if (airports.map(a => a.text).indexOf(chosenRequest) !== -1) {
            this.setState({ airportTo: chosenRequest });
        } else {
            this.openInvalidAirportSnackbar('Invalid destination airport.');
        }
    }

    filterData(searchText, key) {
        return searchText !== '' && key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
    }

    findFlights() {
        let indexOfDepartureAirport = airports.map(a => a.text).indexOf(this.state.airportFrom);
        if (indexOfDepartureAirport === -1) {
            this.openInvalidAirportSnackbar('Invalid departure airport.');
            return;
        }

        let indexOfDestinationAirport = airports.map(a => a.text).indexOf(this.state.airportTo);
        if (indexOfDestinationAirport === -1) {
            this.openInvalidAirportSnackbar('Invalid destination airport.');
            return;
        }

        let departureAirportId = airports[indexOfDepartureAirport].id;
        let destinationAirportId = airports[indexOfDestinationAirport].id;
        let numberOfRoutes = this.convertSelectFieldValueToNumberOfRoutes(this.state.numberOfRoutesValue);

        let requestData = {
            from: departureAirportId,
            to: destinationAirportId,
            number_of_routes: numberOfRoutes,
            airline: {
                seat_comfort_rating: this.convertSelectFieldValueToWeight(this.state.airlineSeatComfortPref),
                cabin_staff_rating: this.convertSelectFieldValueToWeight(this.state.airlineCabinStaffPref),
                food_beverages_rating: this.convertSelectFieldValueToWeight(this.state.airlineFoodPref),
                inflight_entertainment_rating: this.convertSelectFieldValueToWeight(this.state.airlineEntertainmentPref),
                ground_service_rating: this.convertSelectFieldValueToWeight(this.state.airlineGroundServicePref),
                wifi_connectivity_rating: this.convertSelectFieldValueToWeight(this.state.airlineWifiConnectivityPref),
                value_money_rating: this.convertSelectFieldValueToWeight(this.state.airlineValueMoneyPref),
                recommended: this.convertSelectFieldValueToWeight(this.state.airlineUserRecommendationPref)
            },
            airport: {
                queuing_rating: this.convertSelectFieldValueToWeight(this.state.airportQueueingPref),
                terminal_cleanliness_rating: this.convertSelectFieldValueToWeight(this.state.airportTerminalCleanlinessPref),
                terminal_seating_rating: this.convertSelectFieldValueToWeight(this.state.airportTerminalSeatingPref),
                terminal_signs_rating: this.convertSelectFieldValueToWeight(this.state.airportTerminalSignsPref),
                food_beverages_rating: this.convertSelectFieldValueToWeight(this.state.airportFoodPref),
                airport_shopping_rating: this.convertSelectFieldValueToWeight(this.state.airportShoppingPref),
                wifi_connectivity_rating: this.convertSelectFieldValueToWeight(this.state.airportWifiConnectivityPref),
                airport_staff_rating: this.convertSelectFieldValueToWeight(this.state.airportAirportStaffPref),
                recommended: this.convertSelectFieldValueToWeight(this.state.airportUserRecommendationPref)
            }
        };

        this.setState({lastRequestData: requestData});

        socket.emit('get_routes', requestData);
        this.handleLoadingOpen();
    }

    onFlightSelected(flight) {
        this.mapChild.onFlightSelected(flight);
    }

    render(props) {
        const preferencesActions = [
            <FlatButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onClick={this.handlePreferencesClose}
            />,
        ];

        const preferencesPaperStyle = {
            display: 'block',
            height: '100%',
            width: '100%',
            padding: 20,
            marginTop: 0
        };

        const preferencesOptions = [
            <MenuItem value={1} primaryText="Very high" />,
            <MenuItem value={2} primaryText="High" />,
            <MenuItem value={3} primaryText="Default" />,
            <MenuItem value={4} primaryText="Low" />,
            <MenuItem value={5} primaryText="Very low" />
        ];

        const routesNumberOptions = [
            <MenuItem value={1} primaryText="1" />,
            <MenuItem value={2} primaryText="5" />,
            <MenuItem value={3} primaryText="10" />,
            <MenuItem value={4} primaryText="15" />,
            <MenuItem value={5} primaryText="20" />
        ];

        return (
            <div>
                <Grid container spacing={24} style={{ paddingTop: '20px' }}>
                    <Grid item xs={6} sm={6}>
                        <Paper style={{ padding: '10px 20px 20px 20px', height: '300px' }}>
                            <h3 style={{ marginBottom: '0px' }}>Search for flights</h3>
                            <div style={{ width: '49%', display: 'inline-block', marginRight: '20px' }}>
                                <AutoComplete
                                    floatingLabelText="Departure airport"
                                    filter={this.filterData}
                                    dataSource={airports.map(a => a.text)}
                                    maxSearchResults={40}
                                    fullWidth={true}
                                    menuProps={menuProps}
                                    onNewRequest={this.onNewRequestFrom}
                                />
                            </div>
                            <div style={{ width: '49%', display: 'inline-block' }}>
                                <AutoComplete
                                    floatingLabelText="Destination airport"
                                    filter={this.filterData}
                                    dataSource={airports.map(a => a.text)}
                                    maxSearchResults={40}
                                    fullWidth={true}
                                    menuProps={menuProps}
                                    onNewRequest={this.onNewRequestTo}
                                />
                            </div>
                            <br />
                            <div>
                                <RaisedButton label="Preferences" fullWidth={true} primary={true} style={{ marginTop: '30px' }}
                                    onClick={this.handlePreferencesOpen} />
                            </div>
                            <Grid container spacing={24} style={{ paddingTop: '10px' }}>
                                <Grid item xs={6} sm={6}>
                                    <RaisedButton label="Search" fullWidth={true} primary={true} style={{ marginTop: '25px' }}
                                        onClick={this.findFlights} />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                    <SelectField
                                        floatingLabelText="Number of routes"
                                        value={this.state.numberOfRoutesValue}
                                        onChange={this.handleNumberOfRoutesValue}
                                        fullWidth={true}
                                    >
                                        {routesNumberOptions}
                                    </SelectField>
                                </Grid>
                            </Grid>
                            <br />
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <Paper>
                            <FlightMap ref={instance => { this.mapChild = instance; }} />
                        </Paper>
                    </Grid>
                </Grid>
                <br />
                <Grid item xs={12}>
                    <Paper style={{ padding: '0px,10px,10px,10px', fontSize: 'inherit !important' }}>
                        <FlightTable flights={[]} ref={instance => { this.tableChild = instance; }} onFlightSelected={this.onFlightSelected} />
                    </Paper>
                </Grid>

                <Snackbar
                    open={this.state.snackbarInvalidAirportOpen}
                    message={this.state.snackbarInvalidAirportText}
                    onRequestClose={this.handleRequestCloseAirportSnackbar}
                    bodyStyle={{ backgroundColor: '#ff0000' }}
                />

                <Snackbar
                    open={this.state.snackbarServerErrorOpen}
                    message={`Unable to find ${this.convertSelectFieldValueToNumberOfRoutes(this.state.numberOfRoutesValue)} routes between given airports.`}
                    onRequestClose={this.handleRequestCloseServerErrorSnackbar}
                    bodyStyle={{ backgroundColor: '#ff0000' }}
                />

                <Dialog
                    title="Loading..."
                    contentStyle={{ width: '30%', maxWidth: 'none' }}
                    modal={true}
                    open={this.state.loadingOpen}
                    onRequestClose={this.handleLoadingClose}
                >
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress size={80} thickness={5} />
                    </div>
                </Dialog>

                <Dialog
                    title="Flight Preferences"
                    contentStyle={{ width: '70%', maxWidth: 'none' }}
                    actions={preferencesActions}
                    modal={false}
                    open={this.state.preferencesOpen}
                    onRequestClose={this.handlePreferencesClose}
                    autoScrollBodyContent={true}
                >
                    <Grid container spacing={24} style={{ paddingTop: '20px' }}>
                        <Grid item xs={6} sm={6}>
                            <Paper style={preferencesPaperStyle} zDepth={3}>
                                <h4>Airport</h4>
                                <SelectField
                                    floatingLabelText="Queueing"
                                    value={this.state.airportQueueingPref}
                                    onChange={this.handleAirportQueueingPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Terminal cleanliness"
                                    value={this.state.airportTerminalCleanlinessPref}
                                    onChange={this.handleAirportTerminalCleanlinessPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Terminal seating"
                                    value={this.state.airportTerminalSeatingPref}
                                    onChange={this.handleAirportTerminalSeatingPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Terminal signs"
                                    value={this.state.airportTerminalSignsPref}
                                    onChange={this.handleAirportTerminalSignsPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Food/beverages"
                                    value={this.state.airportFoodPref}
                                    onChange={this.handleAirportFoodPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Airport shopping"
                                    value={this.state.airportShoppingPref}
                                    onChange={this.handleAirportShoppingPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Wi-fi connectivity"
                                    value={this.state.airportWifiConnectivityPref}
                                    onChange={this.handleAirportWifiConnectivityPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Airport staff"
                                    value={this.state.airportAirportStaffPref}
                                    onChange={this.handleAirportStaffPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="User recommendation"
                                    value={this.state.airportUserRecommendationPref}
                                    onChange={this.handleAirportUserRecommendationPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={6}>
                            <Paper style={preferencesPaperStyle} zDepth={3}>
                                <h4>Airline</h4>
                                <SelectField
                                    floatingLabelText="Seat comfort"
                                    value={this.state.airlineSeatComfortPref}
                                    onChange={this.handleAirlineSeatComfortPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Cabin staff"
                                    value={this.state.airlineCabinStaffPref}
                                    onChange={this.handleAirlineCabinStaffPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Food/beverages"
                                    value={this.state.airlineFoodPref}
                                    onChange={this.handleAirlineFoodPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Inflight entertainment rating"
                                    value={this.state.airlineEntertainmentPref}
                                    onChange={this.handleAirlineEntertainmentPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Ground service rating"
                                    value={this.state.airlineGroundServicePref}
                                    onChange={this.handleAirlineGroundServicePref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Wi-fi connectivity"
                                    value={this.state.airlineWifiConnectivityPref}
                                    onChange={this.handleAirlineWifiConnectivityPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="Value - money rating"
                                    value={this.state.airlineValueMoneyPref}
                                    onChange={this.handleAirlineValueMoneyPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                                <SelectField
                                    floatingLabelText="User recommendation"
                                    value={this.state.airlineUserRecommendationPref}
                                    onChange={this.handleAirlineUserRecommendationPref}
                                >
                                    {preferencesOptions}
                                </SelectField>
                            </Paper>
                        </Grid>
                    </Grid>
                </Dialog>
            </div>
        );
    }
}

export default FlightSearchForm;