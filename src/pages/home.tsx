import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Divider, Spin, message } from 'antd';
import { 
  TeamOutlined, 
  MedicineBoxOutlined, 
  FileProtectOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../services/api';
import { Patient } from '../types/patient';
import { Treatment } from '../types/treatment';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const { user } = useAuth();
  const { usePatients, useTreatments } = useAPI();
  const { patients, getPatients, loading: patientsLoading } = usePatients();
  const { treatments, medications, getTreatments, getMedications, loading: treatmentsLoading } = useTreatments();
  
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentTreatments, setRecentTreatments] = useState<Treatment[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeTreatments: 0,
    prescriptions: 0,
    appointmentsToday: 0
  });

  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getPatients(),
          getTreatments(),
          getMedications().catch(err => {
            console.warn('Failed to fetch medications:', err);
            return [];
          })
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load some data. Please try again later.');
      }
    };
    
    fetchData();
  }, []);

  // Process data when API responses come in
  useEffect(() => {
    if (patients?.length > 0) {
      // Sort patients by creation date (newest first) and take the first 5
      const sortedPatients = [...patients].sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ).slice(0, 5);
      
      setRecentPatients(sortedPatients);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPatients: patients.length
      }));
    }
  }, [patients]);

  useEffect(() => {
    if (treatments?.length > 0) {
      // Sort treatments by creation date (newest first) and take the first 5
      const sortedTreatments = [...treatments].sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ).slice(0, 5);
      
      setRecentTreatments(sortedTreatments);
      
      // Count active treatments
      const activeTreatments = treatments.filter(t => 
        !t.deletedAt // Consider treatments without deletedAt as active
      ).length;
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeTreatments
      }));
    }
  }, [treatments]);

  useEffect(() => {
    if (medications?.length > 0) {
      // Update stats
      setStats(prev => ({
        ...prev,
        prescriptions: medications.length
      }));
      
      // Count today's appointments (in a real app you might have a specific endpoint for this)
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = medications.filter(m => 
        m.createdAt?.startsWith(today)
      ).length;
      
      setStats(prev => ({
        ...prev,
        appointmentsToday: todayAppointments
      }));
    }
  }, [medications]);

  const isLoading = patientsLoading || treatmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2}>Welcome back, {user?.name}!</Title>
      
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Patients"
              value={stats.totalPatients}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Treatments"
              value={treatments?.length || 0}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Prescriptions"
              value={medications?.length || 0}
              prefix={<FileProtectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Appointments"
              value={stats.appointmentsToday}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Recent Patients" className="mb-4">
            <List
              dataSource={recentPatients}
              renderItem={(patient) => (
                <List.Item>
                  <List.Item.Meta
                    title={patient.name}
                    description={`ID: ${patient.patientId}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No recent patients' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Treatments" className="mb-4">
            <List
              dataSource={treatments?.slice(0, 5) || []}
              renderItem={(treatment) => (
                <List.Item>
                  <List.Item.Meta
                    title={treatment.patient?.name}
                    description={`Treatment: ${treatment.treatmentOptions?.join(', ')}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No recent treatments' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home; 