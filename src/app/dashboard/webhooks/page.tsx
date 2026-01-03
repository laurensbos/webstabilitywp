'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  TestTube, 
  Slack, 
  MessageCircle,
  Globe,
  Check,
  X,
  Loader2,
  Bell,
  Shield,
  Zap,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import styles from './page.module.css';

interface WebhookItem {
  id: string;
  name: string;
  type: 'slack' | 'discord' | 'teams' | 'generic';
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
}

const webhookTypes = [
  { 
    id: 'slack', 
    name: 'Slack', 
    icon: Slack, 
    color: '#4A154B',
    description: 'Stuur meldingen naar een Slack kanaal',
    helpUrl: 'https://api.slack.com/messaging/webhooks'
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: MessageCircle, 
    color: '#5865F2',
    description: 'Stuur meldingen naar een Discord server',
    helpUrl: 'https://support.discord.com/hc/en-us/articles/228383668'
  },
  { 
    id: 'teams', 
    name: 'Microsoft Teams', 
    icon: MessageCircle, 
    color: '#6264A7',
    description: 'Stuur meldingen naar een Teams kanaal',
    helpUrl: 'https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook'
  },
  { 
    id: 'generic', 
    name: 'Generic Webhook', 
    icon: Globe, 
    color: '#22c55e',
    description: 'Stuur JSON data naar elke URL',
    helpUrl: null
  },
];

const eventTypes = [
  { id: 'site_down', label: 'Site Down', icon: AlertCircle, description: 'Als een site offline gaat' },
  { id: 'site_up', label: 'Site Up', icon: Check, description: 'Als een site weer online komt' },
  { id: 'ssl_expiring', label: 'SSL Waarschuwing', icon: Shield, description: 'Als een SSL certificaat bijna verloopt' },
  { id: 'ssl_expired', label: 'SSL Verlopen', icon: Shield, description: 'Als een SSL certificaat is verlopen' },
  { id: 'performance', label: 'Trage Response', icon: Zap, description: 'Als response tijd boven threshold komt' },
];

export default function WebhooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [webhooksList, setWebhooksList] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'slack' as 'slack' | 'discord' | 'teams' | 'generic',
    url: '',
    events: ['site_down', 'site_up'] as string[],
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch('/api/webhooks');
      if (res.ok) {
        const data = await res.json();
        setWebhooksList(data);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchWebhooks();
    }
  }, [status, router, fetchWebhooks]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Geef je webhook een naam');
      return;
    }

    if (!formData.url.trim()) {
      setFormError('Vul de webhook URL in');
      return;
    }

    if (formData.events.length === 0) {
      setFormError('Selecteer minimaal één event');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', type: 'slack', url: '', events: ['site_down', 'site_up'] });
        fetchWebhooks();
        showToast('success', 'Webhook toegevoegd!');
      } else {
        const data = await res.json();
        setFormError(data.error || 'Kon webhook niet toevoegen');
      }
    } catch (error) {
      setFormError('Er ging iets mis');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze webhook wilt verwijderen?')) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        setWebhooksList(prev => prev.filter(w => w.id !== id));
        showToast('success', 'Webhook verwijderd');
      } else {
        showToast('error', 'Kon webhook niet verwijderen');
      }
    } catch (error) {
      showToast('error', 'Er ging iets mis');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);

    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookId: id }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', 'Test melding verzonden! Check je kanaal.');
        fetchWebhooks(); // Refresh to update lastTriggeredAt
      } else {
        showToast('error', data.error || 'Test mislukt');
      }
    } catch (error) {
      showToast('error', 'Kon test niet uitvoeren');
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setWebhooksList(prev => 
          prev.map(w => w.id === id ? { ...w, isActive: !isActive } : w)
        );
        showToast('success', isActive ? 'Webhook gepauzeerd' : 'Webhook geactiveerd');
      }
    } catch (error) {
      showToast('error', 'Kon status niet wijzigen');
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = webhookTypes.find(t => t.id === type);
    return typeConfig?.icon || Globe;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = webhookTypes.find(t => t.id === type);
    return typeConfig?.color || '#22c55e';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nooit';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
        <p>Laden...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toastMessage && (
        <div className={`${styles.toast} ${styles[toastMessage.type]}`}>
          {toastMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {toastMessage.text}
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1><Webhook size={28} /> Webhooks</h1>
          <p>Ontvang real-time meldingen in Slack, Discord of Teams</p>
        </div>
        <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Webhook toevoegen
        </button>
      </div>

      {webhooksList.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <Webhook size={48} />
          </div>
          <h2>Geen webhooks geconfigureerd</h2>
          <p>Voeg een webhook toe om meldingen te ontvangen in je favoriete chat app.</p>
          <button className={styles.addButtonLarge} onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Eerste webhook toevoegen
          </button>
        </div>
      ) : (
        <div className={styles.webhooksList}>
          {webhooksList.map(webhook => {
            const TypeIcon = getTypeIcon(webhook.type);
            const typeColor = getTypeColor(webhook.type);
            
            return (
              <div 
                key={webhook.id} 
                className={`${styles.webhookCard} ${!webhook.isActive ? styles.inactive : ''}`}
              >
                <div className={styles.webhookHeader}>
                  <div className={styles.webhookIcon} style={{ backgroundColor: `${typeColor}20`, color: typeColor }}>
                    <TypeIcon size={24} />
                  </div>
                  <div className={styles.webhookInfo}>
                    <h3>{webhook.name}</h3>
                    <span className={styles.webhookType}>
                      {webhookTypes.find(t => t.id === webhook.type)?.name}
                    </span>
                  </div>
                  <div className={styles.webhookStatus}>
                    <button 
                      className={`${styles.toggleButton} ${webhook.isActive ? styles.active : ''}`}
                      onClick={() => handleToggleActive(webhook.id, webhook.isActive)}
                      title={webhook.isActive ? 'Klik om te pauzeren' : 'Klik om te activeren'}
                    >
                      {webhook.isActive ? 'Actief' : 'Gepauzeerd'}
                    </button>
                  </div>
                </div>

                <div className={styles.webhookUrl}>
                  <code>{webhook.url.substring(0, 60)}...</code>
                </div>

                <div className={styles.webhookEvents}>
                  {webhook.events.map(event => (
                    <span key={event} className={styles.eventBadge}>
                      {eventTypes.find(e => e.id === event)?.label || event}
                    </span>
                  ))}
                </div>

                <div className={styles.webhookMeta}>
                  <span>Laatst getriggerd: {formatDate(webhook.lastTriggeredAt)}</span>
                  <span>Aangemaakt: {formatDate(webhook.createdAt)}</span>
                </div>

                <div className={styles.webhookActions}>
                  <button 
                    className={styles.testButton}
                    onClick={() => handleTest(webhook.id)}
                    disabled={testingId === webhook.id}
                  >
                    {testingId === webhook.id ? (
                      <Loader2 size={16} className={styles.spinner} />
                    ) : (
                      <TestTube size={16} />
                    )}
                    Test
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(webhook.id)}
                    disabled={deletingId === webhook.id}
                  >
                    {deletingId === webhook.id ? (
                      <Loader2 size={16} className={styles.spinner} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Verwijderen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Webhook Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2><Plus size={24} /> Webhook toevoegen</h2>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddWebhook} className={styles.form}>
              {formError && (
                <div className={styles.formError}>
                  <AlertCircle size={18} />
                  {formError}
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Naam</label>
                <input
                  type="text"
                  placeholder="bijv. Marketing Slack"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Type</label>
                <div className={styles.typeGrid}>
                  {webhookTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        className={`${styles.typeOption} ${formData.type === type.id ? styles.selected : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, type: type.id as typeof formData.type }))}
                        style={{ 
                          '--type-color': type.color,
                          borderColor: formData.type === type.id ? type.color : undefined 
                        } as React.CSSProperties}
                      >
                        <Icon size={24} />
                        <span>{type.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className={styles.typeHelp}>
                  {webhookTypes.find(t => t.id === formData.type)?.description}
                  {webhookTypes.find(t => t.id === formData.type)?.helpUrl && (
                    <a 
                      href={webhookTypes.find(t => t.id === formData.type)?.helpUrl || ''} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Hoe maak ik een webhook URL? <ExternalLink size={14} />
                    </a>
                  )}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Webhook URL</label>
                <input
                  type="url"
                  placeholder={
                    formData.type === 'slack' ? 'https://hooks.slack.com/services/...' :
                    formData.type === 'discord' ? 'https://discord.com/api/webhooks/...' :
                    formData.type === 'teams' ? 'https://outlook.office.com/webhook/...' :
                    'https://...'
                  }
                  value={formData.url}
                  onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Events</label>
                <div className={styles.eventsList}>
                  {eventTypes.map(event => {
                    const Icon = event.icon;
                    const isSelected = formData.events.includes(event.id);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        className={`${styles.eventOption} ${isSelected ? styles.selected : ''}`}
                        onClick={() => toggleEvent(event.id)}
                      >
                        <div className={styles.eventCheck}>
                          {isSelected && <Check size={16} />}
                        </div>
                        <Icon size={18} />
                        <div className={styles.eventText}>
                          <span>{event.label}</span>
                          <small>{event.description}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                  Annuleren
                </button>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? <Loader2 size={18} className={styles.spinner} /> : <Plus size={18} />}
                  Webhook toevoegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
