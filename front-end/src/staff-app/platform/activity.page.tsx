import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { Person } from "shared/models/person"
import { RolllStateType } from "shared/models/roll"

interface ActivityApiResponse {
  success:boolean 
  activity:Activity[]
}

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{
    success:boolean 
    activity:Activity[]
  }>({ url: "get-activities" })
  const [getStudents, datas, loadStates] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [activityData,setActivityData] = useState<Activity[]>([])
  const [studentData, setstudentData] = useState<{students: Person[]}>()
  
  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(()=>{
    void getActivities()
  },[getActivities])



  useEffect(()=>{
    if (data){
      const {success,activity} = data
      if (success){
        setActivityData(activity)
      }
    }
  },[data])

  useEffect(()=> {
    if(datas){
      setstudentData(datas)
    }
    
  }, [datas])

  return<div>
     {(activityData.length >0 && studentData &&  studentData?.students.length >0) && <S.Container>{[activityData[0]].map((activity)=>{
      const {entity} = activity
      const rollData ={ student_roll_states:entity.student_roll_states}
      return <div key={activity.date.toLocaleString()}>
        {studentData?.students?.map((s) => (
              
        <StudentListTile key={s.id} isRollMode={true} student={s} rollData={rollData} setRollData={()=>{} }allowChange={false} />
      ))}
      </div>

    })}</S.Container>}
  </div>
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
}
