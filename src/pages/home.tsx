import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Divider, Spin } from 'antd';
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
      await Promise.all([
        getPatients(),
        getTreatments(),
        getMedications()
      ]);
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

  const statsConfig = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <TeamOutlined className="text-4xl text-blue-500" />,
      color: 'blue',
    },
    {
      title: 'Active Treatments',
      value: stats.activeTreatments,
      icon: <MedicineBoxOutlined className="text-4xl text-green-500" />,
      color: 'green',
    },
    {
      title: 'Prescriptions',
      value: stats.prescriptions,
      icon: <FileProtectOutlined className="text-4xl text-orange-500" />,
      color: 'orange',
    },
    {
      title: 'Appointments Today',
      value: stats.appointmentsToday,
      icon: <CalendarOutlined className="text-4xl text-purple-500" />,
      color: 'purple',
    },
  ];

  const isLoading = patientsLoading || treatmentsLoading;

  return (
    <div>
      <div className="mb-6">
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.name || 'User'}!</Text>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <Spin size="large" />
          <div className="mt-4">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {statsConfig.map((stat, index) => (
              <Col xs={12} md={6} key={index}>
                <Card className="h-full">
                  <div className="flex items-center justify-between">
                    <Statistic 
                      title={stat.title}
                      value={stat.value}
                      valueStyle={{ color: `var(--ant-${stat.color}-6)` }}
                    />
                    {stat.icon}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={16} className="mt-6">
            <Col xs={24} md={12}>
              <Card title="Recent Patients" className="h-full">
                {recentPatients.length === 0 ? (
                  <div className="text-center py-5">No patients found</div>
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={recentPatients}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={`${item.name} (${item.patientId || 'ID N/A'})`}
                          description={`Added: ${new Date(item.createdAt || '').toLocaleDateString()}`}
                        />
                        <div>
                          <Text type="success">
                            Active
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Recent Treatments" className="h-full">
                {recentTreatments.length === 0 ? (
                  <div className="text-center py-5">No treatments found</div>
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={recentTreatments}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.treatmentOptions?.[0] || 'Treatment'}
                          description={`Patient ID: ${item.patientId || 'Unknown'}`}
                        />
                        <div>
                          <Text type="secondary">{new Date(item.createdAt || '').toLocaleDateString()}</Text>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Home; 