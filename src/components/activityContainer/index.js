import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ToggleButton from "@material-ui/lab/ToggleButton";
import firebase from "../../config/firebase";
import useDimensions from "../../utils/useDimensions";
import LineChart from "./chart";
import './index.css';

import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import Select from '@material-ui/core/Select';
import SettingsIcon from '@material-ui/icons/Settings';
import MenuItem from '@material-ui/core/MenuItem';
import FreeScrollBar from 'react-free-scrollbar';

const UpperFirst = str =>
  str
    .toLowerCase()
    .replace(/(^|\s)\S/g, firstLetter => firstLetter.toUpperCase());

const durationList = [
  {
    label: "Last 7 days",
    value: 7
  },
  {
    label: "Last 14 days",
    value: 14
  },
  {
    label: "Last 30 days",
    value: 30
  },
  {
    label: "Last 2 months",
    value: 60
  },
  {
    label: "Last 1 year",
    value: 365
  },
  {
    label: "Custom: Select Dates...",
    value: 0
  }
];

const dateFormat = "YYYY/MM/DD";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  behaviorLabel: {
    // padding: theme.spacing(1),
    textAlign: "left",
    fontSize: 14,
    color: "#9aa1a9",
    marginLeft: '40px'
  },
  behavior: {
    // padding: theme.spacing(1),
    fontSize: 20,
    textAlign: "left",
    fontWeight: 'bold',
    fontFamily:'Proxima Nova Regular, sans-serif',
    color: "#505d6f",
    marginLeft: '40px'
  },
  duration: {
    margin: 4
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
    color: "#505d6f"
  },
  select: {
    fontWeight: 700,
    width: 160,
    margin: "0 4px",
    lineHeight: 1.67,
    border: '1px solid #ced4da',
    fontSize: 14,
    padding: '2px 7px',
    borderRadius: 4,
    fontFamily: 'Proxima Nova Regular, sans-serif',
    color: '#525f70'
  },
  behaviorsPan: {
    padding: theme.spacing(2),
    height: 120,
    borderTop: "1px solid #e9ebf1",
    float: 'left',
  },
  behaviorItem: {
    margin: theme.spacing(1),
    padding: "0 4px",
    cursor: "pointer",
    border: "none",
    selected: {
      backgroundColor: 'rgba(6, 83, 151, 0.1)'
    }
  }
}));

const formatTime = date => {
  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()
  return year.toString() + '-' + (parseInt(month.toString()) + 1) + '-' + day.toString()
}

const convertRealDate = (values, colors) => {
  let converted = [];
  for (let i = 0; i < values.length; i++) {
    converted.push({
      ...values[i],
      behaviorData: values[i].behaviorData.map(v => ({
        ...v,
        date: v.date * 1000,
        clr: colors[i]
      }))      
    });
  }
  return converted;
};

const ActivityContainer = ({ data, colorList }) => {
  const classes = useStyles();
//   const realData = convertRealDate(data, colorList);

  const [svgContainerRef, svgSize] = useDimensions();

  const [activities, setActivities] = useState([])
  const [aValue, setAValue] = useState(data[0].activityId)
  
  const [duration, setDuration] = useState(durationList[1].value);
  const [between, setBetween] = useState({
    fromDate:
      new Date().getTime() - (durationList[1].value-1) * 24 * 60 * 60 * 1000,
    toDate: new Date().getTime()
  });

  const [c_target, setCTarget] = useState(data[0].target)
  
  const [toggledFollowings, setToggledFollowings] = useState([
    // data[0].target[0].id
  ]);
  const [selected, setSelected] = useState(false)

  const [activityData, setActivityData] = useState([])

  const [colorMap, setColorMap] = useState([])

  const dateRef = useRef();

  useEffect(() => {
    // firebase
    //   .firestore()
    //   .collection("studentProfile")
    //   .onSnapshot(snapshot => {
    //     snapshot.forEach(doc => {
    //       if (doc.data().id === "d8b9b488212401954b9d75a719405cc7") {
    //         setStudentName(doc.data().firstName + ' ' + doc.data().lastName);
    //       }
    //     });
    //   });    

    let bufActivities = []
    let mat_color = []

    data.forEach((element, i) => {
        bufActivities.push({id: element.activityId, name: element.activityName})
        mat_color.push({id: element.activityId, color: colorList[i]})
    });

    const buf = []

    firebase
    .firestore()
    .collection("activityTargetTrackingEntry")
    .onSnapshot(snapshot => {
      snapshot.forEach(doc => {
        if (
          doc.data().student ===
            "f91978f1783921cef3e86facfdc1c4c1" &&
          doc.data().activityId ===
          aValue &&
          doc.data().dateTime
        ) {
          const clr = mat_color[0].color
          buf.push({date: doc.data().dateTime.seconds * 1000, totalTrialsPercentCorrect: doc.data().totalTrialsPercentCorrect, clr: clr})          
        }
      });
      setActivityData(buf)
    });

    setColorMap(mat_color)
    setActivities(bufActivities)
    setAValue(bufActivities[0].id)

  }, [data]);

  const onChangeDuration = value => {
    if(value.target.value){
      setBetween({
        fromDate: new Date().getTime() - (value.target.value-1) * 24 * 60 * 60 * 1000,
        toDate: new Date().getTime()
      });      
    }
    else{
      dateRef.current.click()
    }
    setDuration(value.target.value);
  };

  const onChangeAValue = value => {   
    const buf = []
    firebase
    .firestore()
    .collection("activityTargetTrackingEntry")
    .onSnapshot(snapshot => {
      snapshot.forEach(doc => {
        if (
          doc.data().student ===
            "f91978f1783921cef3e86facfdc1c4c1" &&
          doc.data().activityId ===
            value.target.value &&
          doc.data().dateTime
        ) {
          const clr = colorMap.filter(element => element.id === value.target.value)
          buf.push({date: doc.data().dateTime.seconds * 1000, totalTrialsPercentCorrect: doc.data().totalTrialsPercentCorrect, clr: clr[0].color})
        }
      });
      setActivityData(buf)
    });

    setAValue(value.target.value)

    data.forEach(element => {
        if(element.activityId === value.target.value){
            setCTarget(element.target)      
            setToggledFollowings([element.target[0].id])
        }      
    });
  };

  const onChangeDateRange = (event, picker) => {    
    setBetween({
      fromDate: picker.startDate._d.getTime(),
      toDate: picker.endDate._d.getTime()
    });
    setDuration(0)
  };

  const onToggleBehavior = id => {
    let toggledList = [...toggledFollowings];
    if (toggledList.includes(id)) {
      toggledList = toggledList.filter(e => e !== id);
    } else {
      toggledList.push(id);
    }
    setToggledFollowings(toggledList);
    setSelected(!selected)
  };

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={12} container sm={4} >
            <Grid item xs={12} sm={6} lg={4} className={classes.behavior}>
                <Grid
                    container
                    justify="flex-end"
                    alignItems="center"
                >
                    <Select
                        value={aValue}
                        className={classes.select}
                        onChange={onChangeAValue}
                    >
                        {activities.map((a) => (
                        <MenuItem  key={a.id} value={a.id}>
                            {a.name}
                        </MenuItem >
                        ))}
                    </Select>
                </Grid>
            </Grid>
        </Grid>
        <Grid item xs={12} sm={8}>
          <div className={classes.duration}>
            <Grid container justify="flex-end" alignItems="center" spacing={1}>
              <Grid item xs={12} sm={6} lg={4}>
                <Grid
                  container
                  justify="flex-end"
                  alignItems="center"
                  spacing={1}
                >
                  <SettingsIcon type="setting" className={classes.icon} />
                  <Select
                    value={duration}
                    className={classes.select}
                    onChange={onChangeDuration}
                  >
                    {durationList.map((d, i) => (
                      <MenuItem  key={i} value={d.value}>
                        {d.label}
                      </MenuItem >
                    ))}
                  </Select>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} md={5} lg={3}>
                <Grid container justify="flex-end">
                  <DateRangePicker 
                    onApply={onChangeDateRange} 
                    startDate={new Date(between.fromDate)}
                    endDate={new Date(between.toDate)}
                    showDropdowns
                    >
                    <input type="text" 
                      className="form-control" 
                      ref={dateRef}
                      value={formatTime(new Date(between.fromDate)) + ' -- ' + formatTime(new Date(between.toDate))} 
                      readOnly
                      />
                  </DateRangePicker>  
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div ref={svgContainerRef}>            
            {svgSize.width && activityData.length !== 0 && (
              <LineChart
                // data={realData.filter(d =>
                //   toggledFollowings.includes(d.behaviorId)
                // )}
                data={activityData}
                behaviors={toggledFollowings}
                width={svgSize.width}
                height={400}
                clientTop={svgSize.top}
                colorList={colorList}
                between={between}
                days={duration}
              />
            )}
          </div>
        </Grid>
        {/* <Grid item xs={12} className={classes.behaviorsPan}>
        <FreeScrollBar>
            <Grid container >            
              {c_target.map((e, i) => (
                <Grid key={e.id}>
                  <Grid
                    container
                    justify="center"                  
                  >
                    <ToggleButton
                    value="behavior"
                    selected={toggledFollowings.includes(e.id)}
                    onClick={() => onToggleBehavior(e.id)}
                    className={classes.behaviorItem}
                  >
                    <span style={{ color: colorList[i] }}>
                      &#11044;
                    </span>&nbsp;{UpperFirst(e.name)}
                  </ToggleButton>
                  </Grid>
                </Grid>
              ))}
            
            </Grid>
          </FreeScrollBar>
        </Grid> */}
      </Grid>
    </div>
  );
};

export default ActivityContainer;
