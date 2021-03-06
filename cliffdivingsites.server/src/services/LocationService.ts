import db from '../data/db';
import LocationCreate from "../models/location/LocationCreate";
import LocationRead from "../models/location/LocationRead";
import LocationDetail from "../models/location/LocationDetail";
import LocationDB from "../models/location/LocationDB";


export const createLocation = (location: LocationCreate): Promise<string> => {
    return db('location')
        .returning('id')
        .insert({
            user_id: '3d5905c9-9c80-4b7a-92c2-7cdb8d5a216b',
            lat: location.lat,
            lng: location.lng,
            display_name: location.displayName,
            title: location.title,
            description: location.description
        })
};

export const getAllLocations = (): Promise<LocationRead[]> => {
    return db('location').select('id', 'lng', 'lat')
};

export const getLocation = (id: string): Promise<LocationDetail> => {
    return db()
        .select('user_id as userId', 'lat', 'lng', 'display_name as displayName', 'title', 'description')
        .where('id', id)
        .table('location')
        .first()
};