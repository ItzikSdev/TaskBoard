import "./App.css";
import { TaskDetails } from "./pages/TaskDetails";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskForm } from "./pages/TaskForm";


const App: React.FC = () => {
 
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TaskForm />} />
          <Route path="/task/:id" element={<TaskDetails />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}



export default App;
