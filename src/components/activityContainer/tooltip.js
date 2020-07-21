import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ScheduleIcon from '@material-ui/icons/Schedule';
import PinDropIcon from '@material-ui/icons/PinDrop';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles(theme => ({
  tooltipWrapper: {
    padding: 3
  },
  divider: {
      borderTop: '1px solid grey',      
  },
  edtbtn: {
      width: 80,
      marginRight: theme.spacing(1),
      marginTop: 4
  },
  delbtn: {
      width: 80,
      color: 'red',
      marginTop: 4
  }
}));

const Tooltip = ({ tooltip }) => {

    const classes = useStyles();

  return (
    <div
      className={`tip-${tooltip.dir}`}
      style={{
        left: tooltip.x,
        top: tooltip.y - 100,
        visibility: tooltip.show ? "visible" : "hidden",
        width: 200,
        height: 200
      }}
    >
      <Grid container spacing={1} className={classes.tooltipWrapper}>
        <Grid item xs={12}>
            <span style={{color: tooltip.data.color}}>&nbsp;&nbsp;⬤</span>&nbsp;{tooltip.data.score}
        </Grid>
        <Grid item xs={12}>
            <PermIdentityIcon /> Jane Doe
        </Grid>
        <Grid item xs={12}>
            <CalendarTodayIcon /> 04-Aug-2019
        </Grid>
        <Grid item xs={12}>
            <ScheduleIcon /> 3:02 PM
        </Grid>
        <Grid item xs={12}>
            <PinDropIcon /> Classroom
        </Grid>
        <Grid item xs={12} className={classes.divider}>
            <Grid container spacing={1} justify="center">
                <Button size="small" variant="contained" color="primary" className={classes.edtbtn}>
                    Edit
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    color="default"                
                    startIcon={<DeleteIcon />}
                    className={classes.delbtn}
                >
                    Delete
                </Button>                
            </Grid>            
        </Grid>        
      </Grid>
    </div>
  );
};

export default Tooltip;
