import React, { useState, useEffect, useCallback, useRef } from 'react';
        import { motion, AnimatePresence } from 'framer-motion';
        import { X, User, Mail, Phone, Building, WalletCards as IdCard, Loader2, Camera, Trash2 } from 'lucide-react';
        import { Button } from '@/components/ui/button';
        import { useData } from '@/contexts/DataContext';
        import { useToast } from '@/components/ui/use-toast';
        import { useModalState } from '@/contexts/ModalStateContext';
        import { supabase } from '@/lib/supabaseClient';
        import { v4 as uuidv4 } from 'uuid';
        import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

        const ClientModal = () => {
          const { user, addClient, updateClient, getClientById } = useData();
          const { toast } = useToast();
          const { openModals, closeModal } = useModalState();
          const { isOpen, clientId } = openModals['client'] || {};
          const client = clientId ? getClientById(clientId) : null;

          const [isLoading, setIsLoading] = useState(false);
          const [selectedFile, setSelectedFile] = useState(null);
          const [previewUrl, setPreviewUrl] = useState(null);
          const fileInputRef = useRef(null);

          const getInitialFormData = useCallback(() => ({
            name: '',
            email: '',
            phone: '',
            client_type: 'Pessoa Física', 
            status: 'Ativo',
            cpf: '',
            cnpj: '',
            profile_photo_url: null,
          }), []);
          
          const [formData, setFormData] = useState(getInitialFormData());

          const DRAFT_KEY = client ? `client_form_draft_${client.id}` : 'client_form_draft_new';

          useEffect(() => {
            if (isOpen) {
              const draft = localStorage.getItem(DRAFT_KEY);
              if (draft) {
                setFormData(JSON.parse(draft));
                setPreviewUrl(JSON.parse(draft).profile_photo_url);
              } else if (client) {
                const clientData = {
                  name: client.name || '',
                  email: client.email || '',
                  phone: client.phone || '',
                  client_type: client.client_type || 'Pessoa Física',
                  status: client.status || 'Ativo',
                  cpf: client.cpf || '',
                  cnpj: client.cnpj || '',
                  profile_photo_url: client.profile_photo_url || null,
                };
                setFormData(clientData);
                setPreviewUrl(clientData.profile_photo_url);
              } else {
                setFormData(getInitialFormData());
                setPreviewUrl(null);
              }
            } else {
              setSelectedFile(null);
              setPreviewUrl(null);
            }
          }, [client, isOpen, DRAFT_KEY, getInitialFormData]);

          useEffect(() => {
            if (isOpen) {
              localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
            }
          }, [formData, isOpen, DRAFT_KEY]);
          
          const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
              setSelectedFile(file);
              setPreviewUrl(URL.createObjectURL(file));
            }
          };

          const handleRemovePhoto = () => {
            setSelectedFile(null);
            setPreviewUrl(null);
            setFormData(prev => ({...prev, profile_photo_url: null}));
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          };

          const handleCloseModal = () => {
            localStorage.removeItem(DRAFT_KEY);
            closeModal('client');
          };
          
          const getInitials = (name) => {
            if (!name) return '?';
            const names = name.split(' ');
            if (names.length === 1) return names[0].charAt(0).toUpperCase();
            return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
          };

          const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!formData.name.trim()) {
              toast({
                title: "Erro de Validação",
                description: "O nome do cliente é obrigatório.",
                variant: "destructive"
              });
              return;
            }

            setIsLoading(true);

            const dataToSave = { ...formData };
            if (dataToSave.client_type === 'Pessoa Física') {
              dataToSave.cnpj = ''; 
            } else {
              dataToSave.cpf = '';
            }

            try {
              let photoUrl = formData.profile_photo_url;
              
              if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${formData.name.replace(/\s+/g, '_')}-${uuidv4()}.${fileExt}`;
                const filePath = `public/${user.id}/client_photos/${fileName}`;
                
                const { error: uploadError } = await supabase.storage
                  .from('user_assets')
                  .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: true,
                  });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                  .from('user_assets')
                  .getPublicUrl(filePath);
                
                photoUrl = publicUrlData.publicUrl;
              } else if (formData.profile_photo_url === null) {
                  photoUrl = null;
              }

              dataToSave.profile_photo_url = photoUrl;

              if (client) {
                await updateClient(client.id, dataToSave);
                toast({
                  title: "Cliente atualizado",
                  description: "Cliente foi atualizado com sucesso!"
                });
              } else {
                await addClient(dataToSave);
                toast({
                  title: "Cliente adicionado",
                  description: "Novo cliente foi adicionado com sucesso!"
                });
              }
              localStorage.removeItem(DRAFT_KEY);
              handleCloseModal();
            } catch(error) {
              toast({
                title: "Erro ao salvar",
                description: `Falha ao salvar cliente: ${error.message}`,
                variant: "destructive"
              });
            } finally {
              setIsLoading(false);
            }
          };

          const handleInputChange = (field, value) => {
            setFormData(prev => {
              const newState = { ...prev, [field]: value };
              if (field === 'client_type') {
                newState.cpf = '';
                newState.cnpj = '';
              }
              return newState;
            });
          };

          if (!isOpen) return null;

          return (
            <AnimatePresence>
              {isOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[5000]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-xl p-0 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col z-[5001]"
                >
                  <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <h2 className="text-xl font-semibold text-foreground">
                      {client ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCloseModal}
                      className="w-8 h-8 text-muted-foreground hover:bg-accent"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto scrollbar-thin">
                    <div className="flex flex-col items-center space-y-3">
                        <Avatar className="w-24 h-24 text-3xl border-4 border-primary/20">
                          <AvatarImage src={previewUrl} alt={formData.name} />
                          <AvatarFallback className="bg-muted-foreground/20 text-foreground font-semibold">
                            {getInitials(formData.name)}
                          </AvatarFallback>
                        </Avatar>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange} 
                          accept="image/png, image/jpeg" 
                          className="hidden" 
                          disabled={isLoading}
                        />
                        <div className='flex items-center gap-2'>
                          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                            <Camera className="w-4 h-4 mr-2" />
                            {previewUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                          </Button>
                          {previewUrl && (
                             <Button type="button" variant="destructive" size="sm" onClick={handleRemovePhoto} disabled={isLoading}>
                               <Trash2 className="w-4 h-4 mr-2" />
                               Remover
                             </Button>
                          )}
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        <User className="w-4 h-4 inline mr-2" />
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Nome do cliente"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        <Building className="w-4 h-4 inline mr-2" />
                        Tipo de Cliente
                      </label>
                      <select
                        value={formData.client_type}
                        onChange={(e) => handleInputChange('client_type', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="Pessoa Física">Pessoa Física</option>
                        <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                      </select>
                    </div>

                    {formData.client_type === 'Pessoa Física' && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          <IdCard className="w-4 h-4 inline mr-2" />
                          CPF (Opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange('cpf', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="000.000.000-00"
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {formData.client_type === 'Pessoa Jurídica' && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          <Building className="w-4 h-4 inline mr-2" />
                          CNPJ (Opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => handleInputChange('cnpj', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="00.000.000/0000-00"
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email (Opcional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="email@exemplo.com"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone (Opcional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="+55 11 99999-9999"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseModal}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 btn-custom-gradient text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (client ? 'Atualizar' : 'Adicionar')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
              )}
            </AnimatePresence>
          );
        };

        export default ClientModal;