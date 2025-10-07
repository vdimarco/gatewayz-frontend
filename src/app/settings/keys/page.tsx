
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, ChevronDown, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { getApiKey, makeAuthenticatedRequest } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

// API Key data type from backend
interface ApiKey {
  id: number;
  api_key: string;
  key_name: string;
  environment_tag: string;
  scope_permissions: Record<string, string[]>;
  is_active: boolean;
  is_primary: boolean;
  expiration_date: string | null;
  days_remaining: number | null;
  max_requests: number | null;
  requests_used: number;
  requests_remaining: number | null;
  usage_percentage: number | null;
  ip_allowlist: string[];
  domain_referrers: string[];
  created_at: string | null;
  updated_at: string | null;
  last_used_at: string | null;
}

// Reusable ApiKeyRow component
const ApiKeyRow = ({
  apiKey,
  onDelete,
  onRefresh
}: {
  apiKey: ApiKey;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}) => {
  const [showFullKey, setShowFullKey] = useState(false);
  const { toast } = useToast();

  const handleCopyClick = () => {
    navigator.clipboard.writeText(apiKey.api_key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete "${apiKey.key_name}"?`)) {
      onDelete(apiKey.id);
    }
  };

  const maskedKey = `${apiKey.api_key.substring(0, 12)}...${apiKey.api_key.substring(apiKey.api_key.length - 4)}`;

  const usage = apiKey.max_requests
    ? `${apiKey.requests_used} / ${apiKey.max_requests}`
    : `${apiKey.requests_used}`;

  const limit = apiKey.max_requests ? `${apiKey.max_requests}` : "Unlimited";

  return (
    <div className="px-4 py-3 hover:bg-gray-50">
      <div className="grid grid-cols-5 gap-4 items-center text-sm">
        <div className="font-medium">
          {apiKey.key_name}
          {apiKey.is_primary && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Primary</span>
          )}
          {!apiKey.is_active && (
            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Inactive</span>
          )}
        </div>
        <div className="font-medium flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs truncate">{maskedKey}</span>
          <TooltipProvider delayDuration={0}>
            <Tooltip open={showFullKey}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullKey(!showFullKey);
                  }}
                  onMouseEnter={(e) => e.preventDefault()}
                  onMouseLeave={(e) => e.preventDefault()}
                >
                  {showFullKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="max-w-md p-3"
                onPointerDownOutside={() => setShowFullKey(false)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs break-all">{apiKey.api_key}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyClick();
                      setShowFullKey(false);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCopyClick}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div className="font-medium">{limit}</div>
        <div className="font-medium">{usage}</div>

        <div className="flex justify-end gap-2">
          {!apiKey.is_primary && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ApiKeysPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Form state
  const [keyName, setKeyName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [includeBYOK, setIncludeBYOK] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchApiKeys = async () => {
    // Check if user is authenticated first
    const apiKey = getApiKey();
    if (!apiKey) {
      setLoading(false);
      setAuthenticating(true);
      return;
    }

    try {
      setLoading(true);
      setAuthenticating(false);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/user/api-keys`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to fetch API keys",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to load API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    let hasStartedFetch = false;
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    // Check for API key periodically until authentication completes
    const checkAndFetch = () => {
      if (hasStartedFetch) return;

      const apiKey = getApiKey();
      if (apiKey) {
        hasStartedFetch = true;
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
        fetchApiKeys();
      }
    };

    // Try immediately
    checkAndFetch();

    // If no key yet, keep checking every 200ms for up to 5 seconds
    interval = setInterval(checkAndFetch, 200);
    timeout = setTimeout(() => {
      if (interval) clearInterval(interval);
      if (!hasStartedFetch) {
        setLoading(false);
        setAuthenticating(false);
      }
    }, 5000);

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [mounted]);

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const requestBody = {
        key_name: keyName,
        environment_tag: "live",
        action: "create",
        max_requests: creditLimit ? parseInt(creditLimit) : null,
        scope_permissions: null,
        expiration_days: null,
        ip_allowlist: [],
        domain_referrers: [],
      };

      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/user/api-keys`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `API key "${keyName}" created successfully!`,
        });

        // Reset form
        setKeyName("");
        setCreditLimit("");
        setIncludeBYOK(false);
        setDialogOpen(false);

        // Refresh the list
        await fetchApiKeys();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to create API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/user/api-keys/${keyId}`,
        {
          method: 'DELETE',
          body: JSON.stringify({ confirmation: "DELETE" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "API key deleted successfully",
        });
        await fetchApiKeys();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to delete API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Prevent hydration mismatch by only checking mounted state on client
  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold">API Keys</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <div className="flex justify-center">
        <h1 className="text-2xl sm:text-3xl font-bold">API Keys</h1>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold">Your API Keys</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white h-10 sm:h-12 px-6 sm:px-10 text-sm sm:text-base w-full sm:w-auto">Generate API Key</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a Key</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    Name <Info className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    id="name"
                    placeholder='e.g. "Chatbot Key"'
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="credit-limit" className="flex items-center gap-1">
                    Request limit (optional) <Info className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    id="credit-limit"
                    type="number"
                    placeholder="Leave blank for unlimited"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                  />
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleTrigger className="flex justify-between items-center w-full text-sm font-medium">
                    Advanced Settings
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="byok-usage" className="flex items-center gap-1">
                        Include BYOK usage in limit <Info className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Switch
                        id="byok-usage"
                        checked={includeBYOK}
                        onCheckedChange={setIncludeBYOK}
                      />
                    </div>
                     <p className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
                       If enabled, this key&apos;s limit will apply to the sum of its BYOK usage and OpenRouter usage.
                     </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={creating}>
                      Cancel
                    </Button>
                  </DialogClose>
                <Button
                  type="submit"
                  onClick={handleCreateKey}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {authenticating ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Authenticating...</p>
              <p className="text-xs text-muted-foreground">Please wait while we verify your account</p>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading your API keys...</p>
            </div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">No API keys yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first API key to get started</p>
              </div>
              <Button
                className="mt-2 bg-black text-white"
                onClick={() => setDialogOpen(true)}
              >
                Generate API Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 overflow-hidden border-x-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-5 gap-4 text-sm font-medium">
                <div>Name</div>
                <div>Key</div>
                <div>Limit</div>
                <div>Usage</div>
                <div></div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <ApiKeyRow
                  key={apiKey.id}
                  apiKey={apiKey}
                  onDelete={handleDeleteKey}
                  onRefresh={fetchApiKeys}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
