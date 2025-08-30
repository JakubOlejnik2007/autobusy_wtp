import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import BuStopImage from "./assets/bus.fill.png";
export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedStops, setSelectedStops] = useState([]);
  const [busStops, setBusStops] = useState([
    {
      "values": [
        {
          "value": "1454",
          "key": "zespol"
        },
        {
          "value": "01",
          "key": "slupek"
        },
        {
          "value": "ks.Czartoryskiej",
          "key": "nazwa_zespolu"
        },
        {
          "value": "0110",
          "key": "id_ulicy"
        },
        {
          "value": "37.33423241",
          "key": "szer_geo"
        },
        {
          "value": "-122.0312186",
          "key": "dlug_geo"
        },
        {
          "value": "Maczka",
          "key": "kierunek"
        },
        {
          "value": "2024-09-08 00:00:00.0",
          "key": "obowiazuje_od"
        }
      ]
    },
    {
      "values": [
        {
          "value": "1454",
          "key": "zespol"
        },
        {
          "value": "01",
          "key": "slupek"
        },
        {
          "value": "ks.Czartoryskiej",
          "key": "nazwa_zespolu"
        },
        {
          "value": "0110",
          "key": "id_ulicy"
        },
        {
          "value": "37.33423241",
          "key": "szer_geo"
        },
        {
          "value": "-122.0292186",
          "key": "dlug_geo"
        },
        {
          "value": "Maczka",
          "key": "kierunek"
        },
        {
          "value": "2024-09-08 00:00:00.0",
          "key": "obowiazuje_od"
        }
      ]
    }
  ]
  );


  const apiKey = "3fe1305c-9a5d-45bd-ac82-93febb07571e";
  const url = `https://api.um.warszawa.pl/api/action/dbstore_get/?id=ab75c33d-3a26-4342-b36a-6e5fef0a3ac3&apikey=${apiKey}`;


  const fetchBusStops = async () => {
    try {
      const response = await axios.get(url)
      console.log(response.data.result[0].values);
      setBusStops(response.data.result);
    } catch (error) {
      console.error(error);
    }
  }
  const getMidPoint = (start, end) => {
    let lat1 = start.latitude;
    let lon1 = start.longitude;
    let lat2 = end.latitude;
    let lon2 = end.longitude;

    const dLon = (lon2 - lon1) * (Math.PI / 180);
    lat1 = lat1 * (Math.PI / 180);
    lat2 = lat2 * (Math.PI / 180);
    lon1 = lon1 * (Math.PI / 180);

    const Bx = Math.cos(lat2) * Math.cos(dLon);
    const By = Math.cos(lat2) * Math.sin(dLon);
    const lat3 = Math.atan2(
      Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
    );
    const lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return { latitude: lat3 * (180 / Math.PI), longitude: lon3 * (180 / Math.PI) };
  };

  const handleMapPress = () => {
    setSelectedStops([]);
  };

  const handleMarkerPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedStops([
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      coordinate
    ]);
  };


  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const toRadians = (deg) => deg * (Math.PI / 180);

    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);
    const distance = Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    ) * R;

    return distance;
  }



  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setErrorMsg('Nie masz uprawnień do lokalizacji'); return; }
      let currentLocation = await Location.getCurrentPositionAsync({}); setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    fetchBusStops();
  }, []);

  let text = 'Wyszukiwanie pozycji...';
  if (errorMsg) { text = errorMsg; }
  else if (location) {
    text = `Szerokość geograficzna: ${location.coords.latitude} \n Długość geograficzna: ${location.coords.longitude}`;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.head}>Aplikacja Lokalizatorek</Text>
      {location ? (
        <>
          <Text style={styles.text}> {text}</Text>
          <MapView style={styles.map}
            initialRegion={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01, }}
            onPress={handleMapPress} onMarkerPress={handleMarkerPress}
          >
            <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude, }} title='Jesteś tutaj :)' />
            {
              busStops.map((busStopResult, index) => {
                const busStop = busStopResult.values;
                const lat = parseFloat(busStop[4].value)
                const lon = parseFloat(busStop[5].value)
                return <Marker key={index} coordinate={{ latitude: lat, longitude: lon, }} title={`${busStop[2].value} ${busStop[1].value}, ${(calcDistance(location.coords.latitude, location.coords.longitude, lat, lon) * 1000).toFixed(2)}m`} image={BuStopImage} />
              }
              )}
            {selectedStops.length === 2 && (
              <>
                <Polyline
                  coordinates={selectedStops}
                  strokeWidth={4}
                  strokeColor="blue"
                />
                <Marker
                  coordinate={getMidPoint(selectedStops[0], selectedStops[1])}
                  title="Połowa linii"
                >
                  <View style={styles.textContainer}>
                    <Text style={styles.text}>{(calcDistance(location.coords.latitude, location.coords.longitude, selectedStops[1].latitude, selectedStops[1].longitude) * 1000).toFixed(2)}m</Text>
                  </View>
                </Marker></>
            )}
          </MapView>
        </>) :

        <Text>Brak uprawnień do lokalizacji urządzenia</Text>}

    </View>
  );
}
const styles = StyleSheet.create(
  {
    container:
    {
      flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',

    },
    map: {
      width: '100%', height: '80%',
    },
    head: {
      fontSize: 24, color: '#62dafb',

    },
    text: {
      fontSize: 16, margin: 10, backgroundColor: '#fff', padding: '10px', width: '50px'
    },
  }
); 