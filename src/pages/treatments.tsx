import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, Tag, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useAPI } from '../services/api';

const { Title } = Typography;

interface TreatmentData {
  id: number;
  patientId: string;
  patientName: string;
  treatmentName: string;
  startDate: string;
  endDate: string | null;
  status: string;
  medications: string[];
}

const Treatments: React.FC = () => {
  const [treatments, setTreatments] = useState<TreatmentData[]>([]);
  const navigate = useNavigate();
  
  // Get API services
  const { useTreatments } = useAPI();
  const { treatments: apiTreatments, getTreatments, loading, error } = useTreatments();

  // Load treatments on component mount
  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      await getTreatments();
    } catch (err) {
      message.error('Failed to fetch treatments');
    }
  };

  // When API data changes, update local state
  useEffect(() => {
    if (apiTreatments && apiTreatments.length > 0) {
      // Transform API data to match our interface
      const formattedTreatments = apiTreatments.map(treatment => ({
        id: treatment.id,
        patientId: treatment.patientId || 'Unknown',
        patientName: treatment.patientName || 'Unknown Patient',
        treatmentName: treatment.treatmentName || treatment.type || 'Unknown Treatment',
        startDate: treatment.startDate || new Date().toISOString().split('T')[0],
        endDate: treatment.endDate,
        status: treatment.endDate ? 'Completed' : 'Active',
        medications: treatment.medications?.map((med: any) => med.name || med) || []
      }));
      setTreatments(formattedTreatments);
    }
  }, [apiTreatments]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (text: string, record: TreatmentData) => (
        <span>{text} ({record.patientId})</span>
      ),
    },
    {
      title: 'Treatment',
      dataIndex: 'treatmentName',
      key: 'treatmentName',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text: string) => text || 'Ongoing',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'blue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Medications',
      dataIndex: 'medications',
      key: 'medications',
      render: (medications: string[]) => (
        <span>
          {medications.length ? 
            medications.map(med => (
              <Tag color="purple" key={med}>
                {med}
              </Tag>
            )) 
            : 'None'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TreatmentData) => (
        <Space size="small">
          <Button size="small" onClick={() => handleAddMedication(record.id)}>
            Add Medication
          </Button>
          <Button size="small" type="link">
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddMedication = (treatmentId: number) => {
    message.info(`Adding medication to treatment ${treatmentId}`);
    navigate('/medications/new');
  };

  // Show error message if API call fails
  useEffect(() => {
    if (error) {
      message.error(`Error: ${error}`);
    }
  }, [error]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Treatments</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/treatments/new')}
        >
          Add Treatment
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={treatments} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Treatments; 