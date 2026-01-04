'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  TestTube, 
  Hash,
  Globe,
  Check,
  X,
  Loader2,
  Bell,
  Shield,
  Zap,
  AlertCircle,
  ExternalLink,
  Users
} from 'lucide-react';
import { pageVariants, staggerContainer, staggerItem } from '@/components/ui/PageTransition';
import styles from './page.module.css';

// Custom SVG icons for platforms
const SlackIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const DiscordIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

const TeamsIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.4 9.38h-.28c.31-.55.48-1.17.48-1.83 0-2.07-1.68-3.75-3.75-3.75-.82 0-1.58.27-2.2.72-.08-.04-.16-.07-.25-.07h-5.8c-.55 0-1 .45-1 1v3.93c0 .55.45 1 1 1h.65v4.45c0 .55.45 1 1 1h2.6c.55 0 1-.45 1-1v-4.45h.65c.55 0 1-.45 1-1V7.45c.24-.07.48-.11.75-.11 1.24 0 2.25 1.01 2.25 2.25 0 .62-.25 1.18-.66 1.58.04.04.08.09.11.14l.98 1.62c.18.29.1.67-.18.86l-.08.05v2.51c0 1.38-1.12 2.5-2.5 2.5h-2c-1.38 0-2.5-1.12-2.5-2.5v-1.5h-2v1.5c0 2.49 2.01 4.5 4.5 4.5h2c2.49 0 4.5-2.01 4.5-4.5v-2.27c.36-.22.64-.54.8-.93l.56-1.4c.18-.44.08-.95-.25-1.29-.1-.11-.23-.2-.36-.26zM9.9 5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
  </svg>
);

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
    icon: SlackIcon, 
    color: '#4A154B',
    description: 'Stuur meldingen naar een Slack kanaal',
    helpUrl: 'https://api.slack.com/messaging/webhooks'
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: DiscordIcon, 
    color: '#5865F2',
    description: 'Stuur meldingen naar een Discord server',
    helpUrl: 'https://support.discord.com/hc/en-us/articles/228383668'
  },
  { 
    id: 'teams', 
    name: 'Microsoft Teams', 
    icon: TeamsIcon, 
    color: '#6264A7',
    description: 'Stuur meldingen naar een Teams kanaal',
    helpUrl: 'https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook'
  },
  { 
    id: 'generic', 
    name: 'Generic Webhook', 
    icon: Globe, 
    color: '#6366f1',
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
    return typeConfig?.color || '#6366f1';
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
    <>
      {/* Toast - buiten motion container voor correcte z-index */}
      {toastMessage && (
        <div className={`${styles.toast} ${styles[toastMessage.type]}`}>
          {toastMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {toastMessage.text}
        </div>
      )}

      <motion.div 
        className={styles.container}
        initial="initial"
        animate="enter"
        variants={pageVariants}
      >
        <motion.div className={styles.header} variants={staggerItem}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Webhook size={24} />
          </div>
          <div className={styles.headerText}>
            <h1>Webhooks</h1>
            <p>Ontvang real-time meldingen in Slack, Discord of Teams</p>
          </div>
        </div>
        <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Webhook toevoegen
        </button>
      </motion.div>

      {webhooksList.length === 0 ? (
        <motion.div className={styles.empty} variants={staggerItem}>
          <div className={styles.emptyIcon}>
            <Webhook size={48} />
          </div>
          <h2>Geen webhooks geconfigureerd</h2>
          <p>Voeg een webhook toe om meldingen te ontvangen in je favoriete chat app.</p>
          <button className={styles.addButtonLarge} onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Eerste webhook toevoegen
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className={styles.webhooksList}
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          {webhooksList.map(webhook => {
            const TypeIcon = getTypeIcon(webhook.type);
            const typeColor = getTypeColor(webhook.type);
            
            return (
              <motion.div 
                key={webhook.id} 
                className={`${styles.webhookCard} ${!webhook.isActive ? styles.inactive : ''}`}
                variants={staggerItem}
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
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>

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
    </>
  );
}
