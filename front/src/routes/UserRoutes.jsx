import { Route } from 'react-router-dom';

import Dashboard from '../pages/user/Dashboard';
import MentorProjects from '../pages/user/MentorProjects';
import UploadProject from '../pages/user/UploadProject';
import Profile from '../pages/user/Profile';
import ProjectDetail from '../pages/user/ProjectDetail';
import AcceptCollaboration from '../pages/user/AcceptCollaboration';
import RequestCollaboration from '../pages/user/RequestCollaboration';
import RequestMentorship from '../pages/user/RequestMentorship';
import RespondMentorship from '../pages/user/RespondMentorship';
import ReportProject from '../pages/user/ReportProject';
import RequestSuccess from '../pages/user/RequestSuccess';
import ColabRequestSuccess from '../pages/user/colabRequestSuccess';
import Inbox from '../pages/user/Inbox';
import MentorRequestDetail from '../pages/user/MentorRequestDetail';
import MentorRespondDetail from '../pages/user/MentorRespondDetail';
import CollabRequestDetail from '../pages/user/CollabRequestDetail';
import CollabRepondDetail from '../pages/user/CollabRepondDetail';
import ReportDetail from '../pages/user/ReportDetail';

const UserRoutes = (
  <>
    <Route path="/" element={<Dashboard />} />
    <Route path="/mentors" element={<MentorProjects />} />
    <Route path="/upload" element={<UploadProject />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/:id" element={<Profile />} />
    <Route path="/project/:id" element={<ProjectDetail />} />
    <Route path="/accept-collaboration" element={<AcceptCollaboration />} />
    <Route path="/request-collaboration" element={<RequestCollaboration />} />
    <Route path="/request-mentorship" element={<RequestMentorship />} />
    <Route path="/respond-mentorship" element={<RespondMentorship />} />
    <Route path="/report-project" element={<ReportProject />} />
    <Route path="/request-success" element={<RequestSuccess />} />
    <Route path="/colab-request-success" element={<ColabRequestSuccess />} />
    <Route path="/inbox" element={<Inbox />} />
    <Route path="/mentor-request/:id" element={<MentorRequestDetail />} />
    <Route path="/mentor-response/:id" element={<MentorRespondDetail />} />
    <Route path="/collab-request/:id" element={<CollabRequestDetail />} />
    <Route path="/collab-response/:id" element={<CollabRepondDetail />} />
    <Route path="/report-detail/:id" element={<ReportDetail />} />
  </>
);

export default UserRoutes;
