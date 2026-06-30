import React from 'react';
import CrudResourcePage from '../../components/common/CrudResourcePage';
import { userApi } from '../../services/userApi';

const blank = { name: '', relationship: '', phone: '', email: '', isPrimary: false };

export default function EmergencyContactsPage() {
  return (
    <CrudResourcePage
      title="Emergency Contacts"
      subtitle="Manage trusted contacts for urgent account support."
      blank={blank}
      fields={[
        { label: 'Name', name: 'name', required: true },
        { label: 'Relationship', name: 'relationship', required: true },
        { label: 'Phone', name: 'phone', required: true },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Primary contact', name: 'isPrimary', type: 'checkbox' }
      ]}
      listApi={userApi.listEmergencyContacts}
      createApi={userApi.createEmergencyContact}
      updateApi={userApi.updateEmergencyContact}
      deleteApi={userApi.deleteEmergencyContact}
      mapItemToForm={(item) => ({
        name: item.name || '',
        relationship: item.relationship || '',
        phone: item.phone || '',
        email: item.email || '',
        isPrimary: Boolean(item.isPrimary)
      })}
      getItemTitle={(item) => item.name}
      renderItemMeta={(item) => (
        <>
          <div className="text-muted-sp small">{item.relationship}</div>
          <div className="text-muted-sp small">{item.phone} {item.email ? `· ${item.email}` : ''}</div>
        </>
      )}
      renderBadges={(item) => item.isPrimary ? <span className="status-pill badge-soft-success">PRIMARY</span> : null}
      confirmDeleteMessage="Delete this emergency contact?"
      loadErrorMessage="Unable to load emergency contacts"
      saveErrorMessage="Unable to save emergency contact"
    />
  );
}
