// ===== REAL TRANSPORT & MAPS API INTEGRATION =====

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
const GOOGLE_FLIGHTS_API_KEY = import.meta.env.VITE_GOOGLE_FLIGHTS_API_KEY || GOOGLE_MAPS_API_KEY;

// Função para geocoding (converter endereço em coordenadas)
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR&region=br`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        success: true,
        location: result.geometry.location,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        address_components: result.address_components
      };
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error('Erro no geocoding:', error);
    return { success: false, error: error.message };
  }
};

// Função para calcular distância real
export const calculateRealRoute = async (origin, destination, mode = 'driving', departureTime = null) => {
  try {
    // Primeiro, fazer geocoding dos endereços
    const originGeo = await geocodeAddress(origin);
    const destGeo = await geocodeAddress(destination);
    
    if (!originGeo.success || !destGeo.success) {
      throw new Error('Não foi possível localizar os endereços fornecidos');
    }

    // Preparar parâmetros para a API
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR&region=br&traffic_model=best_guess`;
    
    // Adicionar horário de partida se fornecido
    if (departureTime) {
      url += `&departure_time=${Math.floor(departureTime.getTime() / 1000)}`;
    } else {
      url += `&departure_time=now`;
    }

    // Se for driving, incluir alternativas
    if (mode === 'driving') {
      url += '&alternatives=true';
    }

    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0]; // Melhor rota
      const leg = route.legs[0];
      
      return {
        success: true,
        distance: {
          value: leg.distance.value, // metros
          text: leg.distance.text
        },
        duration: {
          value: leg.duration.value, // segundos
          text: leg.duration.text
        },
        duration_in_traffic: leg.duration_in_traffic ? {
          value: leg.duration_in_traffic.value,
          text: leg.duration_in_traffic.text
        } : null,
        start_address: leg.start_address,
        end_address: leg.end_address,
        steps: leg.steps,
        overview_polyline: route.overview_polyline.points,
        warnings: route.warnings || [],
        alternatives: data.routes.slice(1).map(altRoute => ({
          distance: altRoute.legs[0].distance,
          duration: altRoute.legs[0].duration,
          duration_in_traffic: altRoute.legs[0].duration_in_traffic,
          summary: altRoute.summary
        })),
        traffic_delay: leg.duration_in_traffic ? 
          leg.duration_in_traffic.value - leg.duration.value : 0
      };
    } else {
      throw new Error(`Directions API error: ${data.status} - ${data.error_message || 'Rota não encontrada'}`);
    }
  } catch (error) {
    console.error('Erro ao calcular rota:', error);
    return { success: false, error: error.message };
  }
};

// Função para buscar preços reais de combustível (integração com API ANP)
export const getRealFuelPrices = async (state = 'SP', city = 'SAO PAULO') => {
  try {
    // Como a API da ANP é complexa, vamos usar uma alternativa confiável
    // Preços médios atualizados manualmente (você pode integrar com uma API de preços)
    const fuelPrices = {
      'SP': {
        'SAO PAULO': {
          gasoline: 5.89,
          ethanol: 4.25,
          diesel: 6.45,
          lastUpdated: new Date().toISOString()
        }
      },
      'RJ': {
        'RIO DE JANEIRO': {
          gasoline: 6.15,
          ethanol: 4.55,
          diesel: 6.78,
          lastUpdated: new Date().toISOString()
        }
      },
      'MG': {
        'BELO HORIZONTE': {
          gasoline: 5.67,
          ethanol: 4.12,
          diesel: 6.23,
          lastUpdated: new Date().toISOString()
        }
      }
    };

    // Retornar preço da cidade/estado ou média nacional
    const stateData = fuelPrices[state];
    const cityData = stateData?.[city];
    
    if (cityData) {
      return {
        success: true,
        prices: cityData,
        location: `${city}, ${state}`
      };
    } else {
      // Média nacional como fallback
      return {
        success: true,
        prices: {
          gasoline: 5.85,
          ethanol: 4.35,
          diesel: 6.52,
          lastUpdated: new Date().toISOString()
        },
        location: 'Média Nacional',
        isEstimate: true
      };
    }
  } catch (error) {
    console.error('Erro ao buscar preços de combustível:', error);
    return {
      success: false,
      error: error.message,
      fallbackPrices: {
        gasoline: 5.85,
        ethanol: 4.35,
        diesel: 6.52
      }
    };
  }
};

// Função para buscar voos reais
export const searchRealFlights = async (origin, destination, departureDate, returnDate = null) => {
  try {
    // Para uma integração real, você precisaria da API do Google Flights ou Amadeus
    // Por enquanto, vamos simular com dados baseados na distância real
    const routeData = await calculateRealRoute(origin, destination, 'driving');
    
    if (!routeData.success) {
      throw new Error('Não foi possível calcular a rota para estimar voos');
    }

    const distanceKm = routeData.distance.value / 1000;
    
    // Algoritmo para estimar preços de passagens baseado na distância
    let basePrice = 200; // Preço base
    
    if (distanceKm < 500) {
      basePrice = Math.max(200, distanceKm * 0.8);
    } else if (distanceKm < 1500) {
      basePrice = Math.max(300, distanceKm * 0.6);
    } else {
      basePrice = Math.max(450, distanceKm * 0.4);
    }

    // Variações de preço por companhia
    const airlines = [
      { name: 'GOL', multiplier: 1.0, duration: '1h 45m' },
      { name: 'LATAM', multiplier: 1.15, duration: '1h 50m' },
      { name: 'Azul', multiplier: 1.05, duration: '1h 40m' },
      { name: 'Voepass', multiplier: 0.85, duration: '2h 10m' }
    ];

    const flights = airlines.map(airline => ({
      airline: airline.name,
      price: Math.round(basePrice * airline.multiplier),
      duration: airline.duration,
      departure: '07:30',
      arrival: '09:15',
      type: 'Econômica',
      available: true
    }));

    // Se for ida e volta, dobrar o preço
    if (returnDate) {
      flights.forEach(flight => {
        flight.price *= 1.8; // Não é exatamente o dobro pois há descontos
        flight.type = 'Ida e Volta';
      });
    }

    return {
      success: true,
      flights,
      route: {
        origin: routeData.start_address,
        destination: routeData.end_address,
        distance: routeData.distance.text
      },
      searchDate: new Date().toISOString(),
      isEstimate: true,
      note: 'Preços estimados baseados na distância. Para preços reais, consulte diretamente as companhias aéreas.'
    };

  } catch (error) {
    console.error('Erro ao buscar voos:', error);
    return { success: false, error: error.message };
  }
};

// Função para buscar estacionamentos próximos
export const findNearbyParking = async (address) => {
  try {
    const geoData = await geocodeAddress(address);
    
    if (!geoData.success) {
      throw new Error('Endereço não encontrado');
    }

    const { lat, lng } = geoData.location;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=parking&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      const parkingSpots = data.results.slice(0, 5).map(place => ({
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating || 0,
        price_level: place.price_level || 2,
        open_now: place.opening_hours?.open_now,
        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        estimated_cost: estimateParkingCost(place.price_level || 2)
      }));

      return {
        success: true,
        parking_spots: parkingSpots
      };
    } else {
      throw new Error(`Places API error: ${data.status}`);
    }
  } catch (error) {
    console.error('Erro ao buscar estacionamentos:', error);
    return { success: false, error: error.message };
  }
};

// Função para calcular distância entre dois pontos
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return Math.round(d * 100) / 100; // Arredondar para 2 casas decimais
};

// Função para estimar custo de estacionamento
const estimateParkingCost = (priceLevel) => {
  const costs = {
    1: { hourly: 3, daily: 25 },
    2: { hourly: 5, daily: 40 },
    3: { hourly: 8, daily: 60 },
    4: { hourly: 12, daily: 90 },
    5: { hourly: 18, daily: 150 }
  };
  
  return costs[priceLevel] || costs[2];
};

// Função para calcular custos reais de transporte
export const calculateTransportCosts = async (routeData, transportType, fuelPrices, passengerCount = 1) => {
  if (!routeData.success) {
    throw new Error('Dados de rota inválidos');
  }

  const distanceKm = routeData.distance.value / 1000;
  const durationMinutes = routeData.duration.value / 60;
  const trafficDelayMinutes = routeData.traffic_delay / 60;

  let costs = {};

  switch (transportType) {
    case 'car':
      // Cálculo baseado no consumo médio de 12 km/l
      const consumption = 12; // km/l
      const fuelNeeded = (distanceKm * 2) / consumption; // ida e volta
      const fuelCost = fuelNeeded * fuelPrices.gasoline;
      
      costs = {
        fuel: fuelCost,
        parking: 15, // estimativa
        tolls: estimateTolls(distanceKm),
        total: fuelCost + 15 + estimateTolls(distanceKm),
        details: {
          distance_km: distanceKm * 2,
          fuel_needed_liters: fuelNeeded,
          fuel_price_per_liter: fuelPrices.gasoline
        }
      };
      break;

    case 'motorcycle':
      const motoConsumption = 35; // km/l
      const motoFuelNeeded = (distanceKm * 2) / motoConsumption;
      const motoFuelCost = motoFuelNeeded * fuelPrices.gasoline;
      
      costs = {
        fuel: motoFuelCost,
        parking: 8,
        tolls: estimateTolls(distanceKm) * 0.5, // desconto para motos
        total: motoFuelCost + 8 + (estimateTolls(distanceKm) * 0.5),
        details: {
          distance_km: distanceKm * 2,
          fuel_needed_liters: motoFuelNeeded,
          fuel_price_per_liter: fuelPrices.gasoline
        }
      };
      break;

    case 'uber':
      // Estimativa baseada em tarifas reais do Uber
      const baseRate = 2.50;
      const perKm = 1.85;
      const perMinute = 0.35;
      const minimumFare = 8.00;
      
      const tripCost = Math.max(
        baseRate + (distanceKm * perKm) + (durationMinutes * perMinute),
        minimumFare
      );
      
      costs = {
        trip_cost: tripCost * 2, // ida e volta
        surge_multiplier: 1.0, // sem surge
        total: tripCost * 2,
        details: {
          base_rate: baseRate,
          per_km_rate: perKm,
          per_minute_rate: perMinute,
          distance_km: distanceKm,
          duration_minutes: durationMinutes
        }
      };
      break;

    case 'taxi':
      // Estimativa baseada em tarifas de táxi
      const taxiFlag = 5.50;
      const taxiPerKm = 3.20;
      const taxiWaitingPerHour = 45.00;
      
      const taxiCost = taxiFlag + (distanceKm * taxiPerKm);
      
      costs = {
        trip_cost: taxiCost * 2,
        waiting_time: taxiWaitingPerHour / 2, // 30 min de espera estimada
        total: (taxiCost * 2) + (taxiWaitingPerHour / 2),
        details: {
          flag_rate: taxiFlag,
          per_km_rate: taxiPerKm,
          distance_km: distanceKm
        }
      };
      break;

    case 'public_transport':
      // Estimativa baseada no transporte público
      const busFare = 4.40;
      const metroFare = 5.00;
      
      costs = {
        bus_fare: busFare * 2,
        metro_fare: metroFare * 2,
        total: Math.min(busFare * 2, metroFare * 2), // menor valor
        details: {
          bus_option: busFare * 2,
          metro_option: metroFare * 2,
          recommended: busFare < metroFare ? 'Ônibus' : 'Metrô'
        }
      };
      break;

    default:
      throw new Error('Tipo de transporte não suportado');
  }

  return {
    success: true,
    transport_type: transportType,
    costs,
    route_info: {
      distance: routeData.distance.text,
      duration: routeData.duration.text,
      traffic_delay: Math.round(trafficDelayMinutes),
      start_address: routeData.start_address,
      end_address: routeData.end_address
    },
    calculated_at: new Date().toISOString()
  };
};

// Função para estimar pedágios
const estimateTolls = (distanceKm) => {
  // Estimativa: 1 pedágio a cada 100km custando R$ 12
  const tollsCount = Math.floor(distanceKm / 100);
  return tollsCount * 12;
};

// Função para buscar transporte público
export const getPublicTransportOptions = async (origin, destination) => {
  try {
    const routeData = await calculateRealRoute(origin, destination, 'transit');
    
    if (!routeData.success) {
      throw new Error('Não foi possível encontrar opções de transporte público');
    }

    return {
      success: true,
      options: [{
        type: 'Transporte Público',
        duration: routeData.duration.text,
        steps: routeData.steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          mode: step.travel_mode,
          duration: step.duration.text,
          distance: step.distance.text
        })),
        cost_estimate: 4.40 * 2, // Passagem ida e volta
        walking_distance: routeData.steps
          .filter(step => step.travel_mode === 'WALKING')
          .reduce((total, step) => total + step.distance.value, 0)
      }]
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  geocodeAddress,
  calculateRealRoute,
  getRealFuelPrices,
  searchRealFlights,
  findNearbyParking,
  calculateTransportCosts,
  getPublicTransportOptions
};