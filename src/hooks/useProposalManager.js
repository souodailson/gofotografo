import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, isEqual } from 'lodash';
import { useDebounce } from './useDebounce';
import { pdfjs } from 'react-pdf';

// The default structure for a new proposal.  Slug is omitted here and will be
// generated automatically when saving a proposal.  Layouts are kept
// separately to support responsive editing.  Blocks are indexed by
// section ID.
export const initialProposalData = {
  nome_da_proposta: 'Nova Proposta',
  client_id: null,
  sections: [{ id: uuidv4(), name: 'Seção 1', height: 842, styles: {} }],
  blocksBySection: {},
  layouts: {
    desktop: {},
    tablet: {},
    mobile: {},
  },
  theme: {
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    headingColor: '#111111',
    accentColor: '#3B82F6',
    fontFamily: {
      key: 'playfair_lato',
      heading: 'Playfair Display',
      body: 'Lato',
      import: 'Playfair+Display:wght@700&family=Lato:wght@400;700'
    },
  },
  is_published: false,
  published_at: null,
};

// Utility to generate a thumbnail for a PDF.  This is used when the
// first block of a section is a PDF; the first page is rendered to a
// canvas and converted to a data URL.  If generation fails the
// original thumbnail remains unchanged.
const generatePdfThumbnail = async (pdfUrl) => {
  try {
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    return null;
  }
};

// Create a URL-friendly slug from a proposal name.  This helper
// normalizes accented characters, replaces whitespace and special
// characters with hyphens and appends a short unique suffix.
const generateSlug = (name) => {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${uuidv4().slice(0, 6)}`;
};

export const useProposalManager = ({ isAdmin = false }) => {
  const { proposalId: routeProposalId } = useParams();
  const navigate = useNavigate();
  const { user } = useData();
  const { toast } = useToast();

  // Local state for the current proposal.  The `proposalId` state
  // mirrors the route param so that newly created proposals can update
  // navigation and local data seamlessly.
  const [proposal, setProposal] = useState(null);
  const [proposalId, setProposalId] = useState(routeProposalId);
  const [isNew, setIsNew] = useState(!routeProposalId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Salvo!');
  const [activeSection, setActiveSection] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  // Keep track of the last saved version of the proposal to avoid
  // unnecessary writes.
  const lastSavedProposal = useRef(null);

  // Determine where to navigate back to when closing the editor.  In
  // admin mode, return to the proposal templates list; otherwise go to
  // the GO.STUDIO home.
  const navigateBackPath = isAdmin ? '/control-acess/proposal-templates' : '/studio';

  /**
   * Fetch a list of uploaded assets (images/PDFs) for the current proposal
   * from Supabase storage.  These are used by the left sidebar in the
   * editor to allow reuse of previously uploaded files.
   */
  const fetchUploads = useCallback(async (currentProposalId) => {
    if (!user || !currentProposalId) return;
    setLoadingUploads(true);
    try {
      const { data, error } = await supabase.storage.from('propostas').list(`${user.id}/${currentProposalId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;
      const urls = data.map(file => supabase.storage.from('propostas').getPublicUrl(`${user.id}/${currentProposalId}/${file.name}`).data.publicUrl);
      setUploads(urls);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({ title: 'Erro ao buscar imagens', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingUploads(false);
    }
  }, [user, toast]);

  /**
   * Load the proposal or template from Supabase.  If the proposal is new,
   * initialize a fresh draft based on the `initialProposalData`.  When
   * loading existing records, merge database fields into the default
   * structure.  Sections, blocks and theme are stored either in
   * `dados_json` (new format) or `state` (legacy).  Layouts are stored
   * separately.  The slug is preserved if present.
   */
  useEffect(() => {
    const fetchProposal = async () => {
      setLoading(true);
      if (isNew) {
        const newProposal = cloneDeep(initialProposalData);
        setProposal(newProposal);
        setActiveSection(newProposal.sections[0]?.id);
        lastSavedProposal.current = cloneDeep(newProposal);
        setLoading(false);
      } else {
        try {
          const tableName = isAdmin ? 'proposal_templates' : 'propostas';
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', proposalId)
            .maybeSingle();
          if (error) throw error;
          if (!data) {
            toast({ title: 'Proposta não encontrada', variant: 'destructive' });
            navigate(navigateBackPath);
            return;
          }
          // Start with defaults, then spread database fields, then apply stored state.
          let loadedProposal = { ...initialProposalData, ...data };
          if (data.dados_json) {
            loadedProposal.sections = data.dados_json.sections || initialProposalData.sections;
            loadedProposal.blocksBySection = data.dados_json.blocksBySection || {};
            loadedProposal.theme = data.dados_json.theme || initialProposalData.theme;
          } else if (data.state) {
            loadedProposal.sections = data.state.sections || initialProposalData.sections;
            loadedProposal.blocksBySection = data.state.blocksBySection || {};
            loadedProposal.theme = data.state.theme || initialProposalData.theme;
            // Legacy state may include layouts, so merge them if present.
            loadedProposal.layouts = data.state.layouts || loadedProposal.layouts;
          }
          // Ensure layouts exist and assign slug from DB if available.
          loadedProposal.layouts = data.layouts || loadedProposal.layouts;
          loadedProposal.slug = data.slug || loadedProposal.slug;

          setProposal(loadedProposal);
          setActiveSection(loadedProposal.sections[0]?.id);
          lastSavedProposal.current = cloneDeep(loadedProposal);
          // Preload uploaded assets for this proposal.
          fetchUploads(proposalId);
        } catch (err) {
          console.error('Error loading proposal:', err);
          toast({ title: 'Erro ao carregar proposta', description: err.message, variant: 'destructive' });
          navigate(navigateBackPath);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, isNew, isAdmin]);

  /**
   * Persist the current proposal to the database.  If nothing has
   * changed since the last save, this function is a no-op.  When
   * creating a new record the proposal ID state is updated and the
   * editor navigates to the proper edit route.  The `forceNav` flag
   * triggers navigation back to the list view after saving.
   */
  const handleSave = useCallback(async (currentProposal, forceNav = false) => {
    if (!currentProposal || !user) return;
    // Avoid saving if there are no changes.
    if (isEqual(currentProposal, lastSavedProposal.current)) {
      setSaveStatus('Salvo!');
      if (forceNav && navigateBackPath) navigate(navigateBackPath);
      return currentProposal;
    }

    setSaving(true);
    setSaveStatus('Salvando...');

    // Construct the payload for the database.  Extract sections,
    // blocks and theme into `dados_json` to allow easy expansion in
    // the future.  Layouts are stored separately.  We also compute
    // a slug if one does not yet exist.
    const { sections, blocksBySection, theme, layouts, nome_da_proposta, client_id, is_published, published_at } = currentProposal;
    const dados_json = { sections, blocksBySection, theme };
    let thumbnailUrl = currentProposal.thumbnail_url;
    // Use the first section's background image as thumbnail if present,
    // otherwise attempt to render a PDF thumbnail.
    const firstSection = sections?.[0];
    const firstSectionBlocks = blocksBySection?.[firstSection?.id] || [];
    const firstSectionPdfBlock = firstSectionBlocks.find(b => b.type === 'pdf' && b.content?.src);
    const firstSectionImageBg = firstSection?.styles?.backgroundImage?.startsWith('url(')
      ? firstSection.styles.backgroundImage.slice(5, -2)
      : firstSection?.styles?.backgroundImage;

    if (firstSectionImageBg) {
      thumbnailUrl = firstSectionImageBg;
    } else if (firstSectionPdfBlock) {
      const pdfDataUrl = await generatePdfThumbnail(firstSectionPdfBlock.content.src);
      if (pdfDataUrl) {
        thumbnailUrl = pdfDataUrl;
      }
    }

    const slug = currentProposal.slug || generateSlug(nome_da_proposta);

    // Build the data object.  Admin templates and user proposals
    // share many fields but have different table names and additional
    // template_name field for templates.
    const dataToSave = {
      nome_da_proposta,
      client_id,
      user_id: user.id,
      updated_at: new Date().toISOString(),
      thumbnail_url: thumbnailUrl,
      dados_json,
      layouts,
      slug,
      is_published,
      published_at,
    };
    if (isAdmin) {
      // For templates, use a separate table and store the template name.
      dataToSave.template_name = nome_da_proposta;
    }

    const tableName = isAdmin ? 'proposal_templates' : 'propostas';

    let savedData;
    let error;
    if (isNew) {
      // Remove any ID property when inserting a new record to allow
      // Supabase to generate one.
      const insertPayload = { ...dataToSave };
      delete insertPayload.id;
      const { data: newData, error: newError } = await supabase
        .from(tableName)
        .insert(insertPayload)
        .select()
        .single();
      savedData = newData;
      error = newError;
    } else {
      const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update(dataToSave)
        .eq('id', proposalId)
        .select()
        .single();
      savedData = updatedData;
      error = updateError;
    }

    setSaving(false);

    if (error) {
      setSaveStatus('Erro ao Salvar!');
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return null;
    }

    setSaveStatus('Salvo!');
    // Reconstruct the full proposal state from the saved DB record.
    let newFullProposal = { ...savedData };
    // Merge stored JSON/state back into top-level fields.
    if (savedData.dados_json) {
      newFullProposal = {
        ...newFullProposal,
        ...savedData.dados_json,
      };
    } else if (savedData.state) {
      newFullProposal = {
        ...newFullProposal,
        ...savedData.state,
      };
    }
    newFullProposal.slug = savedData.slug;
    newFullProposal.layouts = savedData.layouts || newFullProposal.layouts;

    lastSavedProposal.current = cloneDeep(newFullProposal);

    // When creating a new proposal, update state and navigate to the
    // proper edit route.  Admin templates append ?isAdmin=true to
    // indicate that the editor should remain in template mode.
    if (isNew) {
      setIsNew(false);
      setProposalId(savedData.id);
      setProposal(newFullProposal);
      const newPath = isAdmin
        ? `/studio/proposals/edit/${savedData.id}?isAdmin=true`
        : `/studio/proposals/edit/${savedData.id}`;
      navigate(newPath, { replace: true });
    } else {
      setProposal(newFullProposal);
    }

    if (forceNav && navigateBackPath) navigate(navigateBackPath);
    return newFullProposal;
  }, [user, isNew, proposalId, toast, navigate, navigateBackPath, isAdmin]);

  /**
   * Publish a proposal.  This operation is only available for user
   * proposals (not admin templates).  It will first save any
   * unsaved changes, then mark the record as published.  The
   * returned URL points to the public view of the proposal via its
   * slug.
   */
  const handlePublish = useCallback(async () => {
    if (isAdmin) {
      toast({ title: 'Apenas propostas de usuários podem ser publicadas.' });
      return null;
    }
    setSaving(true);
    setSaveStatus('Publicando...');
    const savedProposal = await handleSave(proposal);
    if (!savedProposal || !savedProposal.id) {
      setSaving(false);
      setSaveStatus('Erro ao Salvar!');
      toast({ title: 'Falha na Publicação', description: 'Não foi possível salvar a proposta antes de publicar.', variant: 'destructive' });
      return null;
    }
    const { error } = await supabase
      .from('propostas')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', savedProposal.id);
    setSaving(false);
    if (error) {
      setSaveStatus('Erro ao Publicar!');
      toast({ title: 'Erro ao publicar', description: error.message, variant: 'destructive' });
      return null;
    }
    setSaveStatus('Publicado!');
    const updatedProposalState = { ...proposal, is_published: true, published_at: new Date().toISOString() };
    setProposal(updatedProposalState);
    lastSavedProposal.current = cloneDeep(updatedProposalState);
    const publicUrl = `${window.location.origin}/p/${savedProposal.slug}`;
    return publicUrl;
  }, [handleSave, toast, proposal, isAdmin]);

  // Auto-save when the proposal changes but the user hasn't triggered
  // an explicit save.  Debouncing prevents excessive writes.
  const debouncedProposal = useDebounce(proposal, 5000);
  useEffect(() => {
    if (debouncedProposal && !isNew) {
      handleSave(debouncedProposal);
    }
  }, [debouncedProposal, isNew, handleSave]);

  // Warn the user if they attempt to close or navigate away from the
  // editor with unsaved changes.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isEqual(proposal, lastSavedProposal.current)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [proposal]);

  return {
    proposal,
    setProposal,
    proposalId,
    isNew,
    activeSection,
    setActiveSection,
    loading,
    saving,
    saveStatus,
    uploads,
    loadingUploads,
    handleSave: (forceNav) => handleSave(proposal, forceNav),
    handlePublish,
    fetchUploads,
    navigateBackPath,
  };
};
