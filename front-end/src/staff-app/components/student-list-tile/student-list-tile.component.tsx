import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Images as Image } from "assets/images"
import { Colors } from "shared/styles/colors"
import { Person, PersonHelper } from "shared/models/person"
import { RollStateSwitcher } from "staff-app/components/roll-state/roll-state-switcher.component"
import { RollInput, RolllStateType, RollState } from "shared/models/roll"

interface Props {
  isRollMode?: boolean
  student: Person
  rollData: RollInput
  setRollData:any
  allowChange?:boolean
}
export const StudentListTile: React.FC<Props> = ({ isRollMode, student, rollData,setRollData,allowChange=true  }) => {
  const [currentRollState,setCurrentRollState] = useState<RolllStateType>("unmark")
  const {id:currentStudentId}  = student
  const personFullName = PersonHelper.getFullName(student)
  const defaultPersonAvatar = Image?.avatar

  useEffect(()=>{
    rollData.student_roll_states.forEach((item:RollState)=>{
      if (item.student_id === student.id){
        setCurrentRollState(item.roll_state)
      }
    })
  },[
    rollData
  ])
  
  const handleChangefunction=(attendenceType:RolllStateType)=>{
    const updateStudentsData= rollData.student_roll_states.map((loppingStudent:RollState) =>{
      const {student_id:loppingStudentId} = loppingStudent

      if( currentStudentId == loppingStudentId) {
        loppingStudent.roll_state = attendenceType
      }
      return loppingStudent
    })

    setRollData({student_roll_states:[...updateStudentsData]})
  }
  return (
    <S.Container key={`${currentStudentId}_${currentRollState}`}>
        {defaultPersonAvatar && <S.Avatar url={defaultPersonAvatar}></S.Avatar>}
      {personFullName &&<S.Content>
        <div>{personFullName}</div>
      </S.Content>}
      {isRollMode && (
        <S.Roll>
          <RollStateSwitcher initialState={currentRollState} onStateChange={allowChange ? handleChangefunction:()=>{}} allowChange={allowChange} />
        </S.Roll>
      )}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    margin-top: ${Spacing.u3};
    padding-right: ${Spacing.u2};
    display: flex;
    height: 60px;
    border-radius: ${BorderRadius.default};
    background-color: #fff;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    transition: box-shadow 0.3s ease-in-out;

    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  Avatar: styled.div<{ url: string }>`
    width: 60px;
    background-image: url(${({ url }) => url});
    border-top-left-radius: ${BorderRadius.default};
    border-bottom-left-radius: ${BorderRadius.default};
    background-size: cover;
    background-position: 50%;
    align-self: stretch;
  `,
  Content: styled.div`
    flex-grow: 1;
    padding: ${Spacing.u2};
    color: ${Colors.dark.base};
    font-weight: ${FontWeight.strong};
  `,
  Roll: styled.div`
    display: flex;
    align-items: center;
    margin-right: ${Spacing.u4};
  `,
}
