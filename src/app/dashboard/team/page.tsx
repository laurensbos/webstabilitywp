'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye, 
  Edit3, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  Loader2
} from 'lucide-react';
import styles from './page.module.css';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
  invitedAt: string;
  acceptedAt: string | null;
  permissions: string[];
  memberName: string | null;
  memberEmail: string | null;
}

interface MemberOf {
  id: string;
  ownerId: string;
  role: string;
  permissions: string[];
  ownerName: string | null;
  ownerEmail: string | null;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const [ownedTeam, setOwnedTeam] = useState<TeamMember[]>([]);
  const [memberOf, setMemberOf] = useState<MemberOf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isPaidPlan = session?.user?.plan && ['pro', 'business', 'enterprise'].includes(session.user.plan);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      setOwnedTeam(data.ownedTeam || []);
      setMemberOf(data.memberOf || []);
    } catch (err) {
      console.error('Team ophalen mislukt:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Uitnodigen mislukt');
      }

      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteModal(false);
      fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      fetchTeam();
    } catch (err) {
      console.error('Role update mislukt:', err);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit teamlid wilt verwijderen?')) return;

    try {
      await fetch(`/api/team/${id}`, { method: 'DELETE' });
      fetchTeam();
    } catch (err) {
      console.error('Verwijderen mislukt:', err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className={styles.roleIconAdmin} />;
      case 'editor': return <Edit3 className={styles.roleIconEditor} />;
      default: return <Eye className={styles.roleIconViewer} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Beheerder';
      case 'editor': return 'Bewerker';
      default: return 'Bekijker';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className={`${styles.badge} ${styles.badgeActive}`}>
            <CheckCircle size={12} /> Actief
          </span>
        );
      case 'pending':
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <Clock size={12} /> In afwachting
          </span>
        );
      case 'revoked':
        return (
          <span className={`${styles.badge} ${styles.badgeRevoked}`}>
            <XCircle size={12} /> Ingetrokken
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Team laden...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Users size={28} />
          <div>
            <h1>Team</h1>
            <p>Beheer je teamleden en hun toegangsrechten</p>
          </div>
        </div>
        {isPaidPlan && (
          <button
            className={styles.inviteButton}
            onClick={() => setShowInviteModal(true)}
          >
            <UserPlus size={18} />
            Teamlid uitnodigen
          </button>
        )}
      </div>

      {!isPaidPlan && (
        <div className={styles.upgradeCard}>
          <Crown className={styles.upgradeIcon} />
          <div>
            <h3>Teamfunctionaliteit</h3>
            <p>
              Upgrade naar Pro of Business om teamleden uit te nodigen en samen te werken 
              aan je monitoring dashboard.
            </p>
          </div>
          <a href="/pricing" className={styles.upgradeLink}>
            Bekijk plannen →
          </a>
        </div>
      )}

      {/* Je team */}
      <section className={styles.section}>
        <h2>Jouw team</h2>
        
        {ownedTeam.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <h3>Nog geen teamleden</h3>
            <p>Nodig collega&apos;s uit om samen je websites te monitoren</p>
            {isPaidPlan && (
              <button
                className={styles.inviteButtonSecondary}
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus size={16} />
                Eerste teamlid uitnodigen
              </button>
            )}
          </div>
        ) : (
          <div className={styles.membersList}>
            {ownedTeam.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  <div className={styles.avatar}>
                    {(member.memberName || member.email).charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.memberDetails}>
                    <div className={styles.memberName}>
                      {member.memberName || member.email}
                    </div>
                    <div className={styles.memberEmail}>
                      <Mail size={12} />
                      {member.email}
                    </div>
                  </div>
                </div>
                
                <div className={styles.memberMeta}>
                  {getStatusBadge(member.status)}
                  
                  <select
                    className={styles.roleSelect}
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                  >
                    <option value="viewer">Bekijker</option>
                    <option value="editor">Bewerker</option>
                    <option value="admin">Beheerder</option>
                  </select>
                  
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(member.id)}
                    title="Verwijderen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Teams waar je lid van bent */}
      {memberOf.length > 0 && (
        <section className={styles.section}>
          <h2>Teams waar je lid van bent</h2>
          <div className={styles.membersList}>
            {memberOf.map((team) => (
              <div key={team.id} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  <div className={styles.avatar}>
                    {(team.ownerName || team.ownerEmail || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.memberDetails}>
                    <div className={styles.memberName}>
                      {team.ownerName || team.ownerEmail}
                    </div>
                    <div className={styles.memberEmail}>
                      <Crown size={12} />
                      Team eigenaar
                    </div>
                  </div>
                </div>
                
                <div className={styles.memberMeta}>
                  <span className={styles.roleTag}>
                    {getRoleIcon(team.role)}
                    {getRoleLabel(team.role)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rollen uitleg */}
      <section className={styles.section}>
        <h2>Rollen & rechten</h2>
        <div className={styles.rolesGrid}>
          <div className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <Eye className={styles.roleIconViewer} />
              <h3>Bekijker</h3>
            </div>
            <ul>
              <li>Dashboard bekijken</li>
              <li>Statistieken inzien</li>
              <li>Incidenten bekijken</li>
            </ul>
          </div>
          <div className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <Edit3 className={styles.roleIconEditor} />
              <h3>Bewerker</h3>
            </div>
            <ul>
              <li>Alles van Bekijker</li>
              <li>Sites toevoegen/bewerken</li>
              <li>Alerts configureren</li>
              <li>Onderhoud plannen</li>
            </ul>
          </div>
          <div className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <Shield className={styles.roleIconAdmin} />
              <h3>Beheerder</h3>
            </div>
            <ul>
              <li>Alles van Bewerker</li>
              <li>Teamleden beheren</li>
              <li>Webhooks configureren</li>
              <li>Instellingen wijzigen</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Teamlid uitnodigen</h2>
            <p>Stuur een uitnodiging om je monitoring dashboard te delen</p>
            
            <form onSubmit={handleInvite}>
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.formGroup}>
                <label>E-mailadres</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collega@bedrijf.nl"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Rol</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="viewer">Bekijker - Alleen bekijken</option>
                  <option value="editor">Bewerker - Kan sites beheren</option>
                  <option value="admin">Beheerder - Volledige toegang</option>
                </select>
              </div>
              
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowInviteModal(false)}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className={styles.spinner} size={16} />
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Uitnodiging versturen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
