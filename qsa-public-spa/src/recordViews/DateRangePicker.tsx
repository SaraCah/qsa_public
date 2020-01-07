import React, { useState } from 'react';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

export interface DateRangePickerProps {
  minYear: number;
  maxYear: number;
  minSelected?: number;
  maxSelected?: number;
  onRangeUpdated: (min: number, max: number) => void;
}

export const DateRangePicker: React.FC<any> = (props: DateRangePickerProps) => {
  const [minSelected, setMinSelected] = useState(props.minSelected || props.minYear);
  const [maxSelected, setMaxSelected] = useState(props.maxSelected || props.maxYear);

  const [minTextField, setMinTextField] = useState(props.minSelected || props.minYear);
  const [maxTextField, setMaxTextField] = useState(props.maxSelected || props.maxYear);

  const [changed, setChanged] = useState(false);


  const updateRange = (min: number, max: number) => {
    if (min >= props.minYear && min <= props.maxYear) {
      setMinSelected(min);
    }
    if (max >= props.minYear && max <= props.maxYear) {
      setMaxSelected(max);
    }

    setMinTextField(min);
    setMaxTextField(max);

    if ((min !== (props.minSelected || props.minYear)) || (max !== (props.maxSelected || props.maxYear))) {
      setChanged(true);
    } else {
      setChanged(false);
    }
  };

  return (
    <>
    <div className="date-picker">
      <label className="sr-only" htmlFor="date-picker-start">Limit to records dated after year</label>
      <input id="date-picker-start" className="date-picker-start" type="text" maxLength={4} style={{width: "4em"}} value={minTextField} onChange={(e) => { updateRange(Number(e.target.value), maxSelected) }} />
      <div className="date-picker-range" aria-hidden="true">
        <div style={{paddingTop: "1em"}}>
          <Range
            allowCross={false}
            min={props.minYear}
            max={props.maxYear}
            pushable={1}
            value={[minSelected, maxSelected]}
            onChange={([new_min, new_max]) => { updateRange(new_min, new_max) }} />
        </div>
      </div>
      <label className="sr-only" htmlFor="date-picker-end">Limit to records dated before year</label>
      <input id="date-picker-end" className="date-picker-end" type="text" maxLength={4} style={{width: "4em"}} value={maxTextField} onChange={(e) => updateRange(minSelected, Number(e.target.value))} />
      {changed && <div className="date-picker-apply">
        <button className="btn btn-xs btn-secondary"
                style={{marginLeft: "1em"}}
                onClick={() => props.onRangeUpdated(minSelected, maxSelected)} >
          Apply
        </button>
      </div>}
    </div>

    </>
  );
}
