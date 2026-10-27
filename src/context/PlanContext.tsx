import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPlan, SubscriptionBilling, UserSubscription } from '../types';
import { DataService } from '../services/store';
import { useAuth } from './AuthContext';
import { useToast } from './NotificationContext';

interface PlanContextType {
  subscription: UserSubscription;
  plan: UserPlan;
  freeUsesRemaining: number;
  aiUsesRemaining: number;
  isWatermarkRequired: boolean;
  canExportDocx: boolean;
  canUseFullATS: boolean;
  canUseCustomSlug: boolean;
  canBuildCoverLetter: boolean;
  canAccessTemplate: (templateId: string) => boolean;
  consumeFreeUse: (actionName?: string) => boolean;
  consumeAiUse: () => boolean;
  refreshSubscription: () => void;
  upgradeSubscription: (plan: UserPlan, billing: SubscriptionBilling, paymentId: string) => void;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
  isUpgradeModalOpen: boolean;
  upgradeFeaturePrompt: string;
  openCheckoutModal: (targetPlan: UserPlan, billing?: SubscriptionBilling) => void;
  closeCheckoutModal: () => void;
  isCheckoutModalOpen: boolean;
  checkoutTargetPlan: UserPlan;
  checkoutBilling: SubscriptionBilling;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState<UserSubscription>(() =>
    DataService.getSubscription(user?.id)
  );

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeaturePrompt, setUpgradeFeaturePrompt] = useState('');

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutTargetPlan, setCheckoutTargetPlan] = useState<UserPlan>('basic');
  const [checkoutBilling, setCheckoutBilling] = useState<SubscriptionBilling>('one-time');

  const refreshSubscription = () => {
    const sub = DataService.getSubscription(user?.id);
    setSubscription({ ...sub });
  };

  useEffect(() => {
    refreshSubscription();
  }, [user?.id]);

  const plan = subscription.plan;
  const freeUsesRemaining = plan === 'free' ? (subscription.freeUsesRemaining ?? 3) : 999;
  const aiUsesRemaining =
    plan === 'premium'
      ? 9999
      : plan === 'basic'
      ? (subscription.aiUsesRemaining ?? 5)
      : (subscription.freeUsesRemaining ?? 3);

  const isWatermarkRequired = plan === 'free';
  const canExportDocx = plan !== 'free';
  const canUseFullATS = plan === 'premium';
  const canUseCustomSlug = plan === 'premium';
  const canBuildCoverLetter = plan === 'premium';

  const canAccessTemplate = (templateId: string): boolean => {
    if (plan === 'premium' || plan === 'basic') return true;
    // Free plan has 2 simple templates
    return templateId === 'modern-tech' || templateId === 'minimal-classic';
  };

  const openUpgradeModal = (featureName = 'this feature') => {
    setUpgradeFeaturePrompt(featureName);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeFeaturePrompt('');
  };

  const openCheckoutModal = (targetPlan: UserPlan, billing: SubscriptionBilling = 'one-time') => {
    setCheckoutTargetPlan(targetPlan);
    setCheckoutBilling(targetPlan === 'premium' ? (billing === 'one-time' ? 'monthly' : billing) : 'one-time');
    setIsUpgradeModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const consumeFreeUse = (actionName = 'PDF download / action'): boolean => {
    if (plan !== 'free') return true;

    const remaining = subscription.freeUsesRemaining ?? 3;
    if (remaining <= 0) {
      openUpgradeModal(`You have used all 3 free ${actionName} credits. Upgrade to Basic (₹99) or Premium for unlimited access!`);
      return false;
    }

    const nextCount = DataService.decrementFreeUse();
    refreshSubscription();

    if (nextCount > 0) {
      showToast(`1 free use used. You have ${nextCount} free use${nextCount === 1 ? '' : 's'} remaining.`, 'info');
    } else {
      showToast(`This was your last free use! Upgrade to Basic or Premium to keep downloading & sharing.`, 'warning');
    }

    return true;
  };

  const consumeAiUse = (): boolean => {
    if (plan === 'premium') return true;

    if (plan === 'basic') {
      const remaining = subscription.aiUsesRemaining ?? 5;
      if (remaining <= 0) {
        openUpgradeModal('You have exhausted your 5 Basic AI summary credits. Upgrade to Premium for unlimited AI suggestions!');
        return false;
      }
      DataService.decrementAiUse();
      refreshSubscription();
      return true;
    }

    // Free plan: counts towards the 3 free uses or prompts upgrade
    const remaining = subscription.freeUsesRemaining ?? 3;
    if (remaining <= 0) {
      openUpgradeModal('AI Suggestion requires an active plan or free use credits. Upgrade now!');
      return false;
    }
    DataService.decrementFreeUse();
    refreshSubscription();
    return true;
  };

  const upgradeSubscription = (newPlan: UserPlan, billing: SubscriptionBilling, paymentId: string) => {
    const updated: UserSubscription = {
      userId: user?.id || 'anonymous',
      plan: newPlan,
      billing,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate:
        billing === 'yearly'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : billing === 'monthly'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      paymentId,
      freeUsesRemaining: 999,
      aiUsesRemaining: newPlan === 'premium' ? 9999 : 5,
      sendsCount: subscription.sendsCount || 0,
    };

    DataService.saveSubscription(updated);
    setSubscription(updated);
    setIsCheckoutModalOpen(false);
    setIsUpgradeModalOpen(false);

    showToast(`Successfully upgraded to ${newPlan.toUpperCase()} Plan!`, 'success');
  };

  return (
    <PlanContext.Provider
      value={{
        subscription,
        plan,
        freeUsesRemaining,
        aiUsesRemaining,
        isWatermarkRequired,
        canExportDocx,
        canUseFullATS,
        canUseCustomSlug,
        canBuildCoverLetter,
        canAccessTemplate,
        consumeFreeUse,
        consumeAiUse,
        refreshSubscription,
        upgradeSubscription,
        openUpgradeModal,
        closeUpgradeModal,
        isUpgradeModalOpen,
        upgradeFeaturePrompt,
        openCheckoutModal,
        closeCheckoutModal,
        isCheckoutModalOpen,
        checkoutTargetPlan,
        checkoutBilling,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
