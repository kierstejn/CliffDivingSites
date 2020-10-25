import React, {useEffect, useState, Fragment} from 'react';
import Container from '@material-ui/core/Container';
import {makeStyles} from "@material-ui/core/styles";
import {Button, CssBaseline, Grid, Paper, TextField, Typography, CircularProgress} from "@material-ui/core";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useHistory } from 'react-router-dom';
import { GeocodedAddress } from "../models/geocoding/GeocodedAddress";
import { useForm } from "react-hook-form";
import { GeocodedLocationResult } from "../models/geocoding/GeocodedLocationResult";

import axios from "../axios";
import LocationCreate from "../models/location/LocationCreate";

//Redux
import {useDispatch} from "react-redux";
import {showSnackBar, SnackBarActionTypes} from '../store/snackBar/actions';
import { MessageTypes } from '../models/snackBar/snackBar';



const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    inputField: {
        marginBottom: 20
    },
    form: {
        display: 'flex',
        flexDirection: 'column'
    },
    submitButton: {
        width: 100
    },
    circularProgress: {
        color: 'white'
    }
}));

type FormData = {
    title: string;
    description: string;
};

const CreateSitePage = () => {

    const classes = useStyles();
    const { user, getAccessTokenSilently } = useAuth0();
    const location = useLocation();
    const history = useHistory();
    const { register, errors, handleSubmit } = useForm<FormData>();
    const [geoLocation, setGeoLocation] = useState<GeocodedLocationResult | null>(null);
    const dispatch = useDispatch();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');

    useEffect(() => {
        const state = location.state;
        if(!state){
            history.push('/')
        }
        // @ts-ignore
        setGeoLocation(state)
    }, [location]);

    const onSubmit = async (formData: FormData) => {
        if(!geoLocation){
            return;
        }
        setIsSubmitting(true);
        const token = await getAccessTokenSilently();
        const data: LocationCreate = {
            lat: geoLocation.lat,
            lng: geoLocation.lng,
            displayName: geoLocation.address?.display_name,
            title: formData.title,
            description: formData.description
        };
        try {
            const response = await axios.post('/location', data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(showSnackBar({message: 'Site was successfully created!', messageType: MessageTypes.Success}));
            history.push('/');
        } catch (e) {
            dispatch(showSnackBar({message: 'Error occurred!', messageType: MessageTypes.Error}));
            setSubmitError(e);
        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <Fragment>
            <CssBaseline/>
            <Container maxWidth="lg" className={classes.container}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Create new site
                        </Typography>
                        {geoLocation && geoLocation.address &&
                            <Typography variant="body2" component="p" gutterBottom>
                                {geoLocation.address.display_name}
                            </Typography>
                        }
                        {geoLocation && !geoLocation.address &&
                            <Typography variant="body2" component="p">
                                {`Latitude: ${geoLocation.lat} - Longtitude: ${geoLocation.lng}`}
                            </Typography>
                        }
                        <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
                            <TextField
                                required
                                id="title"
                                label="Title"
                                variant="outlined"
                                inputRef={register}
                                name={'title'}
                                className={classes.inputField}
                                style={{marginTop: 10}}
                            />
                            <TextField
                                required
                                id="description"
                                label="Description"
                                multiline
                                name={'description'}
                                inputRef={register}
                                rows={4}
                                variant="outlined"
                                className={classes.inputField}
                            />
                            <Button
                                type={'submit'}
                                color={'secondary'}
                                fullWidth={false}
                                variant={'contained'}
                                className={classes.submitButton}
                                disabled={isSubmitting}
                            >
                                {!isSubmitting ? 'Create' : <CircularProgress size={20} className={classes.circularProgress}/>}
                            </Button>
                        </form>
                    </Paper>
                </Grid>
            </Container>
        </Fragment>
    );
};

export default CreateSitePage;