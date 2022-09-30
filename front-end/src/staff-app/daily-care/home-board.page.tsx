import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RollInput, RolllStateType, RollState } from "shared/models/roll";

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [studentData, setstudentData] = useState<{students: Person[]}>()
  const [searchFilter,setSearchFilter]=useState<string>("")
  const [rollData,setRollData] = useState<RollInput>({
    student_roll_states:[]
  })
  const [rollStateFilter,setRollStateFilter] = useState("none")
  
  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(()=> {
    if(data){

      const currentRollData = data.students.map((item)=>{
        return {student_id:item.id,roll_state:"unmark" as RolllStateType}
      })
      setRollData({
        student_roll_states:[...currentRollData]
      })
      setstudentData(data)
    }
    
  }, [data])

  useEffect(()=>{
    handleChange()
  },[searchFilter])

  useEffect(()=>{
   const filteredData = getFilterData() as  {students :Person[]}
    setstudentData({...filteredData})
  },[rollStateFilter])

  const filterStudenDataByRollState = (flashData: undefined | {students :Person[]}=undefined)=>{
    const currentStudentData = flashData ? flashData : studentData
    if(rollStateFilter !=="none" && rollData.student_roll_states.length&&currentStudentData?.students.length){
      const studentHistory = {}  as any
      const allCurrentStateStudentIds = rollData.student_roll_states.filter((items:RollState)=>items.roll_state ==rollStateFilter).forEach(item=>studentHistory[item.student_id] = item.student_id)
      const filterStudents = currentStudentData?.students.filter(item=> item.id in studentHistory) as Person[]
      return{...currentStudentData,
        students:[...filterStudents]}
    }
    else{
      return {...data}
    }
  }

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    } 
    else{
      setIsRollMode(false)
    }
  }

  const handleChange =() => {
    if(!searchFilter) {
      const filteredData = filterStudenDataByRollState(data) as {students :Person[]}
      setstudentData({...filteredData})
      return;
    } 
    
    const filteredStudents = getFilterData() as  {students :Person[]}
    
    
    
    if (!filteredStudents) {
      return;
    }
    
    setstudentData({...filteredStudents})
  } 

  const getFilterData = ()=>{
    const filteredStudents = data?.students.filter((students) => {
      const {id:studentId} = students
      let rollFilterResult:boolean = false
      const rollInfo = rollData.student_roll_states.find(item=>item.student_id === studentId)
      if (rollInfo){
        rollFilterResult = rollStateFilter === rollInfo.roll_state || (rollStateFilter==="none")
      }
      const filterIncludesName = `${students.first_name} ${students.last_name}`
      .toLowerCase()
      .includes(searchFilter.toLowerCase())
      return filterIncludesName&& rollFilterResult ;
    });
    const filterObject = {
      students: filteredStudents 
    }
    return filterObject
  }

  const handleSelectChange = (value: string | undefined, sort: boolean | undefined ) => {
    if(!value) return;
      if(sort === true) {
        let ascSorted = ascnSort(value)
        if(!ascSorted) {
          return;
        }
        const sortedObject = {
          students: ascSorted 
        }
        setstudentData(sortedObject)
      }
      else {
        let desSorted = descSort(value)
        if(!desSorted) {
          return;
        }
        const sortedObject = {
          students: desSorted 
        }
        setstudentData(sortedObject)
      }
  }

  const ascnSort = (value: string | undefined) => {
    let sorted;
    if(value === 'first_name') {
      sorted = studentData?.students.sort((a, b) => {
        return b.first_name > a.first_name ? 1 : -1 
      });
    }
    else if(value === 'last_name') {
      sorted = studentData?.students.sort((a, b) => {
        return b.last_name > a.last_name ? 1 : -1;
      });
    }
    return sorted
  }

  const descSort = (value: string | undefined) => {
    let sorted;
    if(value === 'first_name') {
      sorted = studentData?.students.sort((a, b) => {
        return b.first_name < a.first_name ? 1 : -1;
      });
    }else if (value === 'last_name') {
      sorted = studentData?.students.sort((a, b) => {
        return b.last_name < a.last_name ? 1 : -1;
      });
    }
    return sorted 
  }



  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }
  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} onHandleChange={(e)=>setSearchFilter(e as string)} handleSelectChange={(e, sort) => handleSelectChange(e, sort)} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}
        {loadState === "loaded" && data?.students && (
          <>
            {studentData?.students?.map((s) => (
              
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} rollData={rollData} setRollData={setRollData} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} rollData={rollData} rollStateFilter={rollStateFilter} setRollStateFilter={setRollStateFilter}/>
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  onHandleChange: (value?: string) => void
  handleSelectChange: (value?: any, sort?: any) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, onHandleChange, handleSelectChange } = props
  const [isSort, setIsSort] = useState(false)
  const [name, setName] = useState<string>()
  const handleSelectInside = (value: string) => {
    setName(value)
    handleSelectChange(value, isSort)
  } 
  const handleSort = () => {
    if(isSort === false) {
      setIsSort(true)
    }
    else {
      setIsSort(false)
    }
    if(name) {
      handleSelectChange(name, isSort)
    }  
    else {
      alert("Select a Name")
    }
  }
  return (
    <S.ToolbarContainer>
      <FormControl fullWidth style={{ backgroundColor: `white`, borderRadius: `4px` }}>
        <InputLabel id="demo-simple-select-label">Select Name</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={name}
          placeholder=""
          onChange={(e)=> handleSelectInside(e.target.value as string)}
          // onChange={(e)=>onSelectChange(e.target.value/)}
        >
          <MenuItem value="first_name">First Name</MenuItem>
          <MenuItem value="last_name">LastName</MenuItem>
        </Select>
      </FormControl>
      {isSort ?
        <S.Button onClick={() => handleSort()}>
          <FontAwesomeIcon icon="sort-alpha-up" />
        </S.Button> :
        <S.Button onClick={() => handleSort()}>
          <FontAwesomeIcon icon="sort-alpha-down" />
        </S.Button>
      } 
      <TextField
          style={{ backgroundColor: 'white', padding: `4px`, borderRadius: `4px` }}
          fullWidth
          focused
          placeholder="Search"
          onChange={(e) => onHandleChange(e.target.value)}
          
          
      />
      <S.Button style={{ width: '30%' }} onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
