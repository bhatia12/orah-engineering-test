import React, { useEffect, useState } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/Button"
import { BorderRadius, Spacing } from "shared/styles/styles"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import { RollInput, RollState } from "shared/models/roll"
import { useApi } from "shared/hooks/use-api"
import {Link} from "react-router-dom"
import { useNavigate } from "react-router-dom";
export type ActiveRollAction = "filter" | "exit"
interface Props {
  isActive: boolean
  onItemClick: (action: ActiveRollAction, value?: string) => void
  rollData: RollInput
  rollStateFilter:string
  setRollStateFilter:(type:string)=>void
}

export const ActiveRollOverlay: React.FC<Props> = ({ isActive, onItemClick, rollData,rollStateFilter,setRollStateFilter }) => {
  const [saveRoll, data, loadState] = useApi({ url: "save-roll" })
  const [attendenceAnalysis,setAttendenceAnalysis] = useState({
    all:0,
    present:0,
    absent:0,
    late:0
  })
  let navigate = useNavigate(); 
  useEffect(()=>{
    if (rollData?.student_roll_states){
    let all = 0
    let present=0
    let absent=0
    let late=0
    rollData?.student_roll_states.forEach((item:RollState)=>{
      if (item.roll_state ==="present"){
        present ++
      }
      if (item.roll_state ==="absent"){
        absent ++
      }
      if (item.roll_state ==="late"){
        late ++
      }
      if (item.roll_state !=="unmark"){
        all ++
      }

    })
    setAttendenceAnalysis({
      all,
      present,
      absent,
      late
    })

  }
  },[rollData?.student_roll_states])

  const handleCompleteFunctionClick = ()=>{
    saveRoll(rollData)
    let path = ("/staff/activity");; 
    navigate(path);
  }

  const toggleRollStateFilter=(filter:string)=>{
    if(rollStateFilter === filter || filter =="all"){
      setRollStateFilter("none")
      return
    } 
    if (rollStateFilter === "none" || rollStateFilter !== filter) setRollStateFilter(filter)
  }
  const exitButtonClickHandler =()=>{
    setRollStateFilter("none")
    onItemClick("exit")
  }
  return (
    <S.Overlay isActive={isActive}>
      <S.Content>
        <div>Class Attendance</div>
        <div>
          <RollStateList
          onItemClick={toggleRollStateFilter}
            stateList={[
              { type: "all", count: attendenceAnalysis.all },
              { type: "present", count: attendenceAnalysis.present },
              { type: "late", count: attendenceAnalysis.late },
              { type: "absent", count: attendenceAnalysis.absent },
            ]}
          />
          <div style={{ marginTop: Spacing.u6 }}>
            <Button color="inherit" onClick={exitButtonClickHandler}>
              Exit
            </Button>
            <Button color="inherit" style={{ marginLeft: Spacing.u2 }} onClick={handleCompleteFunctionClick}>
              Complete
            </Button>
          </div>
        </div>
      </S.Content>
    </S.Overlay>
  )
}

const S = {
  Overlay: styled.div<{ isActive: boolean }>`
    position: fixed;
    bottom: 0;
    left: 0;
    height: ${({ isActive }) => (isActive ? "120px" : 0)};
    width: 100%;
    background-color: rgba(34, 43, 74, 0.92);
    backdrop-filter: blur(2px);
    color: #fff;
  `,
  Content: styled.div`
    display: flex;
    justify-content: space-between;
    width: 52%;
    height: 100px;
    margin: ${Spacing.u3} auto 0;
    border: 1px solid #f5f5f536;
    border-radius: ${BorderRadius.default};
    padding: ${Spacing.u4};
  `,
}
