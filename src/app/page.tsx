"use client";

import { useState, useEffect } from "react";
import { analyticsApi, appointmentApi, notificationsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: number;
  patient_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string;
  notes?: string;
}

interface Analytics {
  total_appointments: number;
  pending_billing: number;
  active_patients: number;
  avg_wait_time: string;
  todays_appointments: Appointment[];
  revenue_trend: string;
  follow_up_alerts: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleData, setRescheduleData] = useState({
    id: 0,
    date: "",
    time: "",
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsApi.get();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      const response = await appointmentApi.confirm(appointmentId);
      if (response.success) {
        loadAnalytics(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };

  const handleRescheduleAppointment = async () => {
    try {
      const response = await appointmentApi.reschedule(
        rescheduleData.id,
        rescheduleData.date,
        rescheduleData.time
      );
      if (response.success) {
        loadAnalytics(); // Refresh data
        setRescheduleData({ id: 0, date: "", time: "" });
      }
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
    }
  };

  const sendNotification = async (patientName: string, message: string) => {
    try {
      const response = await notificationsApi.send(message, "1234567890"); // Dummy phone
      if (response.success) {
        alert(`Notification sent to ${patientName}`);
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rescheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "patients", label: "Patients" },
    { id: "appointments", label: "Appointments" },
    { id: "billing", label: "Billing" },
    { id: "reports", label: "Reports" },
    { id: "prescriptions", label: "Prescriptions" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation Panel */}
      <div className="w-64 bg-white shadow-lg">
        {/* Header with Doctor's Name and Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src="https://placehold.co/50x50?text=Dr+Logo+Clean+medical+symbol" 
              alt="Clean medical logo with professional typography" 
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%23f3f4f6'/%3E%3Ctext x='25' y='30' text-anchor='middle' fill='%236b7280' font-size='12'%3EDr%3C/text%3E%3C/svg%3E";
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dr. Smith</h1>
              <p className="text-sm text-gray-600">Clinic Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button className="w-full text-left px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 mt-4">
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === "dashboard" && (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

            {/* Top Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {analytics?.total_appointments || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics?.pending_billing || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Active Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics?.active_patients || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg. Wait Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.avg_wait_time || "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Appointments */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.todays_appointments?.length ? (
                  <div className="space-y-4">
                    {analytics.todays_appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {appointment.patient_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {appointment.appointment_time} - {appointment.reason}
                              </p>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {appointment.status !== "Confirmed" && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmAppointment(appointment.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setRescheduleData({
                                    id: appointment.id,
                                    date: appointment.appointment_date,
                                    time: appointment.appointment_time,
                                  })
                                }
                              >
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reschedule Appointment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="date">New Date</Label>
                                  <Input
                                    id="date"
                                    type="date"
                                    value={rescheduleData.date}
                                    onChange={(e) =>
                                      setRescheduleData({
                                        ...rescheduleData,
                                        date: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="time">New Time</Label>
                                  <Input
                                    id="time"
                                    type="time"
                                    value={rescheduleData.time}
                                    onChange={(e) =>
                                      setRescheduleData({
                                        ...rescheduleData,
                                        time: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <Button
                                  onClick={handleRescheduleAppointment}
                                  className="w-full"
                                >
                                  Reschedule
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              sendNotification(
                                appointment.patient_name,
                                `Reminder: You have an appointment today at ${appointment.appointment_time}`
                              )
                            }
                          >
                            Notify
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No appointments scheduled for today.</p>
                )}
              </CardContent>
            </Card>

            {/* AI Insights Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Follow-up Alerts</h4>
                    <p className="text-2xl font-bold text-blue-700">
                      {analytics?.follow_up_alerts || 0}
                    </p>
                    <p className="text-sm text-blue-600">Patients need follow-up</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Revenue Trend</h4>
                    <p className="text-lg font-semibold text-green-700">
                      {analytics?.revenue_trend || "Stable"}
                    </p>
                    <p className="text-sm text-green-600">Compared to last month</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Reminders</h4>
                    <p className="text-sm text-purple-700">
                      • Update patient records
                      <br />
                      • Review pending bills
                      <br />
                      • Schedule follow-ups
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "dashboard" && (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
              {activeTab}
            </h2>
            <Card>
              <CardContent className="p-8">
                <p className="text-gray-600 text-center">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
