import React from "react";
import { compose, withProps } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline } from "react-google-maps";

export default class GoogleMapComponent extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            airports: []
        };

        this.MapComponent = compose(
            withProps({
                googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBIBBIRZlWkExS0aO5oeRHKqFZ-XjAXLgs&v=3.exp&libraries=geometry,drawing,places",
                loadingElement: <div style={{ height: `100%` }} />,
                containerElement: <div style={{ height: `300px` }} />,
                mapElement: <div style={{ height: `100%` }} />,
            }),
            withScriptjs,
            withGoogleMap
        )((props) =>
            <GoogleMap
                defaultZoom={2}
                defaultCenter={{ lat: 0, lng: 0 }}
                ref={(map) => {this.map = map;}}
            >
                {props.markers.map((marker) => {
                    return (
                        <Marker position={{ lat: marker.lat, lng: marker.lng }} />
                    );
                })}

                {<Polyline path={props.markers}/>}
            </GoogleMap>
        );

        this.calcBoundsOfCoords = this.calcBoundsOfCoords.bind(this);
        this.onFlightSelected = this.onFlightSelected.bind(this);
    }

    calcBoundsOfCoords = (coods) => {
        return new window.google.maps.LatLngBounds({
            lat: Math.min(...coods.map(c => c.lat)), 
            lng: Math.min(...coods.map(c => c.lng))
        }, {
            lat: Math.max(...coods.map(c => c.lat)), 
            lng: Math.max(...coods.map(c => c.lng)) 
        });
    }

    onFlightSelected = (flight) => {
        this.setState({ 
            airports: flight.coordinates,
        });
        let bounds = this.calcBoundsOfCoords(flight.coordinates);
        this.map.fitBounds(bounds);
    }

    render() {
        return (
            <this.MapComponent
                markers={this.state.airports}
            />
        )
    }
}