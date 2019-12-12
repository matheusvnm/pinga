import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Typography, Grid } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    StyledAppBar: {
        boxShadow: 'none'
    },
}));

export default function ButtonAppBar() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar className={classes.StyledAppBar} style={{ backgroundColor: 'white', bottom: 0, position: 'fixed' }} position="relative">
                <Grid container direction="row" justify="center" alignItems="center">
                    <Typography style={{ color: 'black' }}variant="subtitle1" gutterBottom>
                        Versão: 0.1.0 | Desenvolvido para disciplina de RPVI 2019.2
                    </Typography>
                </Grid>
                <AppBar className={classes.StyledAppBar} style={{ backgroundColor: '#009045', height: '5px' }} position="static"></AppBar>
            </AppBar>
        </div>
    );
}