// app/dashboard/page.jsx
import React from "react";
import GeneralTopDataSection from "./components/GeneralTopDataSection";
import FeedContainer from "./components/feed/FeedContainer";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <GeneralTopDataSection />
      <FeedContainer />
    </div>
  );
}