import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Grid, Link } from '@material-ui/core';
import SvgIcon from '@material-ui/core/SvgIcon'

import logo from '../../assets/logoMain.png'
import logoUni from '../../assets/logoUnipampa.jpg'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  StyledAppBar: {
    boxShadow: 'none'
  },
  title: {
    flexGrow: 1,
    color: 'white'
  },
  rootIcon: {
    '& > svg': {
      margin: theme.spacing(2),
      color: 'white'
    },
  },
}));

function HomeIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </SvgIcon>
  );
}

export default function ButtonAppBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar className={classes.StyledAppBar} style={{ backgroundColor: 'white' }} position="static">
        <AppBar className={classes.StyledAppBar} style={{ backgroundColor: '#009045', height: '5px' }} position="static"></AppBar>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Link href='/' underline="none" >
              <img style={{ width: '60%', height: '60%', float: 'left' }} src={logo} alt="HomePage" />
            </Link>
            <Link href='https://unipampa.edu.br/portal/' underline="none" style={{ display: 'contents'}}>
              <img style={{ width: '10%', height: '10%', float: 'right' }} src={logoUni} alt="UnipampaPage" />
            </Link>
          </Grid>
        </Toolbar>
        <AppBar className={classes.StyledAppBar} style={{ backgroundColor: '#009045', height: '50px' }} position="static">
          <Toolbar>
          <Grid container direction="row" alignItems="center">
            <Link href='/' underline="none" >
              <Grid container direction="row" justify="flex-start" alignItems="center">
                <div className={classes.rootIcon}>
                  <HomeIcon />
                </div>
                <Typography variant="h6" className={classes.title}>HOME</Typography>
              </Grid>
            </Link>
          </Grid>
          </Toolbar>
        </AppBar>
      </AppBar>
    </div>
  );
}