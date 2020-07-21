import React, { useRef, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import * as d3 from "d3";
import moment from "moment";
import Tooltip from './tooltip';
import './index.css';

const formatTime = d3.timeFormat("%b-%d");
const tooltip_width = 200;

const useStyles = makeStyles(theme => ({
  typography: {
    padding: theme.spacing(2)
  }
}));

const LineChart = ({ data, width, height, clientTop, behaviors, between, days }) => {
  const svgRef = useRef();  

  const [tooltipState, setTooltipState] =  useState({x: 0, y: 0, show: false, dir: 'left', mode: '', data: {}});
  
  const classes = useStyles();

  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll("*")
      .remove();

    const margin = { top: 10, right: 20, bottom: 50, left: 50 },
      w = width - margin.left - margin.right,
      h = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    if (!behaviors || data.length === 0) {
      svg
        .append("text")
        .attr("x", w / 2)
        .attr("y", h / 2)
        .attr("text-anchor", "middle")
        .attr("stroke", "red")
        .attr("font-size", 10)
        .attr("fill", "#fff")
        .text("No data in the period you selected");

      return;
    }

    let v_datas = [],
      filtered = [],
      phaseLines = [],
      behaviorName = [],
      color = "";

    const offset = -new Date().getTimezoneOffset() / 60;

    //add rect for hide tooltip
    svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", 400)
      .attr("fill", 'transparent')
      .on("click", () => {
        setTooltipState({...tooltipState, show: false});
      });

    if (between) {
      filtered = data
        .filter(d => d.date >= between.fromDate && d.date <= between.toDate)
        .sort((a, b) => (a.date < b.date ? -1 : 0));

      if (filtered && filtered.length) {
        let baseDate = moment(
          filtered[0].date - offset * 60 * 60 * 1000
        ).format("MMM Do YY");
        let baseTime = filtered[0].date;
        let sum_d = 0;
        let count = 0;
        let s_day = [];
        color = filtered[0].clr;
        filtered.forEach((element, index) => {
          if (
            moment(element.date - offset * 60 * 60 * 1000).format(
              "MMM Do YY"
            ) === baseDate
          ) {
            sum_d += element.totalTrialsPercentCorrect;
            count++;
            if (index === filtered.length - 1)
              s_day.push({ date: baseTime, score: sum_d / count });
          } else {
            s_day.push({ date: baseTime, score: sum_d / count });
            baseDate = moment(element.date - offset * 60 * 60 * 1000).format(
              "MMM Do YY"
            );
            baseTime = element.date;
            sum_d = element.totalTrialsPercentCorrect;
            count = 1;
            if (index === filtered.length - 1)
              s_day.push({ date: baseTime, score: sum_d / count });
          }
        });
        v_datas.push(s_day);
      }
    } else return;

    let averScores = [];
    //get the offset between current time zone and default time zone

    if (!v_datas.length) {
      svg
        .append("text")
        .attr("x", w / 2)
        .attr("y", h / 2)
        .attr("text-anchor", "middle")
        .attr("stroke", "red")
        .attr("font-size", 10)
        .attr("fill", "#fff")
        .text("No data in the period you selected");

      return;
    }

    for (let i = 0; i < v_datas.length; i++) {
      averScores[i] = d3.mean(v_datas[i].map(d => d.score)).toFixed(1);
    }

    let sum = [];

    for (let i = 0; i < v_datas.length; i++) {
      sum.push(...v_datas[i].map(d => d.score));
    }
    
    const x = d3
      .scaleTime()
      .domain([
        between.fromDate - 24 * 60 * 60 * 1000,
        between.toDate + 12 * 60 * 60 * 1000
      ])
      .rangeRound([0, w]);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${h})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-h)
          .ticks(days === 7 || days === 14 ? d3.timeDay.every(1) : 14)
      );

    xAxis.select(".domain").attr("stroke", "#e9ebf1");
    xAxis
      .selectAll(".tick")
      .select("text")
      .attr("transform", () => (days !== 7 ? "rotate(-65)" : "rotate(0)"))
      .attr("text-anchor", days !== 7 ? "end" : "middle")
      .attr("clr", "#9aa1a9")
      .text(d => formatTime(d));
    xAxis
      .selectAll(".tick")
      .select("line")
      .attr("stroke", "#e9ebf1");

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([h, 0]);

    const yAxis = svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-w)
    );

    yAxis.select(".domain").attr("stroke", "#e9ebf1");
    yAxis
      .selectAll(".tick")
      .select("text")
      .attr("clr", "#9aa1a9");
    yAxis
      .selectAll(".tick")
      .select("line")
      .attr("stroke", "#e9ebf1");

    for (let i = 0; i < v_datas.length; i++) {
      //append average score tag and dot line
      svg
        .append("rect")
        .attr("x", -40)
        .attr("y", y(averScores[i]) - 7.5)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width", 30)
        .attr("height", 25)
        .attr("fill", color);

      svg
        .append("text")
        .attr("x", -25)
        .attr("y", y(averScores[i]) + 8)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#fff")
        .text("Avg.");

      svg
        .append("line")
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .style("stroke-dasharray", "6, 3") //between.fromDate - 56 * 60 * 60 * 1000, between.toDate + 24 * 60 * 60 * 1000
        .attr("x1", x(between.fromDate - 24 * 60 * 60 * 1000))
        .attr("y1", y(averScores[i]))
        .attr("x2", x(between.toDate + 12 * 60 * 60 * 1000))
        .attr("y2", y(averScores[i]))
        .attr("cursor", "pointer")
        .on("mouseover", () => {       
          setTooltipState({x: d3.event.pageX + 10, y: y(averScores[i]) + clientTop - 3, show: true, mode: 'tip', data: {}});          
        })
        .on("mouseout", () => {
          setTooltipState({...tooltipState, show: false});

        });

      //add the phase lines
      const yValue = [0, 100];
      let l_datas = [];

      if (phaseLines[i]) {
        for (let p_i = 0; p_i < phaseLines[i].length; p_i++) {
          svg
            .append("path")
            .datum(yValue)
            .attr("class", "phase-line")
            .attr("fill", "none")
            .attr("class", "phase-line")
            .attr("stroke", v_datas[i][0].clr)
            .attr("stroke-width", 1)
            .style("stroke-dasharray", "6, 3")
            .attr(
              "d",
              d3
                .line()
                .x(
                  x(
                    parseInt(phaseLines[i][p_i] / (24 * 60 * 60)) *
                      1000 *
                      24 *
                      60 *
                      60 -
                      offset * 60 * 60 * 1000
                  )
                )
                .y(d => y(d))
            )
            .attr("cursor", "pointer");
        }
        //seperate the basic line into several lines by phase lines.
        for (let p = 0; p < phaseLines[i].length + 1; p++) {
          if (p === 0) {
            l_datas[p] = v_datas[i].filter(
              d => d.date < phaseLines[i][p] * 1000
            );
            continue;
          }
          if (p === phaseLines[i].length) {
            l_datas[p] = v_datas[i].filter(
              d => d.date > phaseLines[i][p - 1] * 1000
            );
            continue;
          } else
            l_datas[p] = v_datas[i].filter(
              d =>
                d.date > phaseLines[i][p - 1] * 1000 &&
                d.date < phaseLines[i][p] * 1000
            );
        }
        for (let l = 0; l < l_datas.length; l++) {
          //append score viewData
          if (l_datas[l].length)
            svg
              .append("path")
              .datum(l_datas[l])
              .attr("fill", "none")
              .attr("stroke", v_datas[i][0].clr)
              .attr("stroke-width", 2)
              .attr(
                "d",
                d3
                  .line()
                  .defined(function(d) {
                    return d.score !== null;
                  })
                  .x(d =>
                    x(
                      parseInt(d.date / (1000 * 24 * 60 * 60)) *
                        1000 *
                        24 *
                        60 *
                        60 -
                        offset * 60 * 60 * 1000
                    )
                  )
                  .y(d => y(d.score))
              );
          else continue;
        }
      } else {
        //append score viewData
        svg
          .append("path")
          .datum(v_datas[i])
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr(
            "d",
            d3
              .line()
              .defined(function(d) {
                return d.score !== null;
              })
              .x(d =>
                x(
                  parseInt(d.date / (1000 * 24 * 60 * 60)) *
                    1000 *
                    24 *
                    60 *
                    60 -
                    offset * 60 * 60 * 1000
                )
              )
              .y(d => y(d.score))
          );
      }

      svg
        .selectAll(".circles")
        .data(v_datas[i].filter(d => d.score))
        .enter()
        .append("circle")
        .attr("cx", d =>
          x(
            parseInt(d.date / (1000 * 24 * 60 * 60)) * 1000 * 24 * 60 * 60 -
              offset * 60 * 60 * 1000
          )
        )
        .attr("cy", d => y(d.score))
        .attr("r", 5)
        .attr("fill", color)
        .attr("cursor", "pointer")      
        .on("click", d => {
          let dir = "left", offset_x = 0;
          console.log(tooltip_width + d3.event.pageX + 50, width, 'compare')
          if(tooltip_width + d3.event.pageX + 50 > width) {
            dir = "right";
            offset_x = -tooltip_width - 25;
          }else{            
            dir = "left";
          }
          setTooltipState({x: d3.event.pageX + offset_x + 12, y: y(d.score) + clientTop + 9, show: true, dir: dir, mode: 'dialog', data: {color: color, score: d.score}});
        });      
      
    }
  }, [data, width, height, behaviors, between, days]);



  return (
    <div>
      <Tooltip direction="left" tooltip={tooltipState} />
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default LineChart;
