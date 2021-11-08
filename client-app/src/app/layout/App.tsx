import React, { Fragment, useEffect, useState } from "react";
import { Container } from "semantic-ui-react";
import { Activity } from "../models/activity";
import NavBar from "./NavBar";
import ActivityDashboard from "../../features/activities/dashborad/ActivityDashboard";
import { v4 as uuid } from "uuid";
import agent from "../api/agent";
import LoadingComponent from "./LoadingComponent";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setActivity] = useState<Activity | undefined>(
    undefined
  );
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setsubmitting] = useState(false);

  useEffect(() => {
    agent.Activities.list().then((response) => {
      let activities: Activity[] = [];
      response.forEach((activity) => {
        activity.date = activity.date.split("T")[0];
        activities.push(activity);
      });
      setActivities(activities);
      setLoading(false);
    });
  }, []);

  const handleSelectActivity = (id: string) =>
    setActivity(activities.find((a) => a.id === id));

  const handleCancelSelectedActivity = () => setActivity(undefined);

  const handleFormOpen = (id?: string) => {
    id ? handleSelectActivity(id) : handleCancelSelectedActivity();
    setEditMode(true);
  };

  const handleFormClose = () => setEditMode(false);

  const handleCreateOrEditActivity = async (activity: Activity) => {
    try {
      setsubmitting(true);
      if (activity.id) {
        console.log("test");
        await agent.Activities.update(activity);
        setActivities([
          ...activities.filter((a) => a.id !== activity.id),
          activity,
        ]);
        setEditMode(false);
        setActivity(activity);
        setsubmitting(false);
      } else {
        activity.id = uuid();
        await agent.Activities.create(activity);
        setActivities([...activities, activity]);
        setEditMode(false);
        setActivity(activity);
        setsubmitting(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      setsubmitting(true);
      await agent.Activities.delete(id);
      setActivities([...activities.filter((a) => a.id !== id)]);
      setActivity(undefined);
      setsubmitting(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <LoadingComponent content="Loading App" />;

  return (
    <>
      <NavBar openForm={handleFormOpen} />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard
          activities={activities}
          selectedActivity={selectedActivity}
          selectActivity={handleSelectActivity}
          cancelActivity={handleCancelSelectedActivity}
          editMode={editMode}
          openForm={handleFormOpen}
          closeForm={handleFormClose}
          createOrEdit={handleCreateOrEditActivity}
          deleteActivity={handleDeleteActivity}
          submitting={submitting}
        />
      </Container>
    </>
  );
}

export default App;
