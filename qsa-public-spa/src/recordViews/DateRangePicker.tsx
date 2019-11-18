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
    <div>
      <input type="text" maxLength={4} style={{width: "4em"}} value={minTextField} onChange={(e) => { updateRange(Number(e.target.value), maxSelected) }} />
      <div style={{width: "60%", display: "inline-block", marginLeft: "1em", marginRight: "1em"}}>
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
      <input type="text" maxLength={4} style={{width: "4em"}} value={maxTextField} onChange={(e) => updateRange(minSelected, Number(e.target.value))} />
      {changed && <button className="btn btn-xs btn-secondary"
                          style={{marginLeft: "1em"}}
                          onClick={() => props.onRangeUpdated(minSelected, maxSelected)} >
        Apply
      </button>}
    </div>

    </>
  );
}
