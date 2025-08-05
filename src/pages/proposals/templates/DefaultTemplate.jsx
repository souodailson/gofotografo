import React from 'react';

const ProposalTemplate = ({ data }) => {
  const {
    photographerName = 'Nome do Fotógrafo',
    missionText = 'Texto da missão...',
    sessionDetails = 'Detalhes da sessão...',
    structureDetails = 'Detalhes da estrutura...',
    packages = [],
    paymentConditions = 'Condições de pagamento...',
    testimonials = [],
    faq = [],
    finalCall = 'Chamada final...',
    coverImage = 'https://via.placeholder.com/800x300',
    galleryImages = [],
  } = data || {};

  const defaultStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&display=swap');
    .proposal-container {
      font-family: 'Roboto', sans-serif;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background-color: #fff;
    }
    .proposal-h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 2rem;
    }
    .proposal-h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      position: relative;
      padding-bottom: 0.5rem;
    }
    .proposal-h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 1px;
      background-color: #ccc;
    }
    .proposal-p {
      line-height: 1.6;
      margin-bottom: 1rem;
      text-align: justify;
    }
    .cover-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      margin-bottom: 2rem;
    }
    .package-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .testimonial-block {
      font-style: italic;
      padding: 1rem;
      border-left: 3px solid #ecce9a;
      margin-bottom: 1rem;
    }
    .faq-item {
      margin-bottom: 1rem;
    }
    .faq-q {
      font-weight: bold;
    }
    .gallery-image {
      width: 100%;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
  `;

  return (
    <>
      <style>{defaultStyles}</style>
      <div className="proposal-container">
        <img-replace src={coverImage} alt="Capa da Proposta" className="cover-image" />
        <h1 className="proposal-h1">{photographerName}</h1>
        <p className="proposal-p" style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '3rem' }}>
          {missionText}
        </p>

        <section>
          <h2 className="proposal-h2">Apresentação</h2>
          <p className="proposal-p">{sessionDetails}</p>
        </section>

        <section>
          <h2 className="proposal-h2">Ambientes e Estrutura</h2>
          <p className="proposal-p">{structureDetails}</p>
        </section>

        <section>
          <h2 className="proposal-h2">Planos e Pacotes</h2>
          {packages.map((pkg, index) => (
            <div key={index} className="package-card">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '0.5rem' }}>{pkg.name}</h3>
              <p className="proposal-p">{pkg.description}</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'right' }}>R$ {pkg.price}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="proposal-h2">Condições de Pagamento</h2>
          <p className="proposal-p">{paymentConditions}</p>
        </section>

        {testimonials && testimonials.length > 0 && (
          <section>
            <h2 className="proposal-h2">Depoimentos</h2>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-block">
                <p className="proposal-p">"{testimonial.quote}"</p>
                <p style={{ textAlign: 'right', fontWeight: 'bold' }}>- {testimonial.author}</p>
              </div>
            ))}
          </section>
        )}

        {faq && faq.length > 0 && (
          <section>
            <h2 className="proposal-h2">Dúvidas Frequentes</h2>
            {faq.map((item, index) => (
              <div key={index} className="faq-item">
                <p className="faq-q">{item.question}</p>
                <p className="proposal-p">{item.answer}</p>
              </div>
            ))}
          </section>
        )}

        {galleryImages && galleryImages.length > 0 && (
          <section>
            <h2 className="proposal-h2">Galeria</h2>
            {galleryImages.map((image, index) => (
              <img-replace key={index} src={image} alt={`Imagem da galeria ${index + 1}`} className="gallery-image" />
            ))}
          </section>
        )}

        <section style={{ marginTop: '4rem', textAlign: 'center' }}>
          <h2 className="proposal-h2" style={{ border: 'none' }}>{finalCall}</h2>
          <p className="proposal-p">Entre em contato para agendarmos sua sessão!</p>
        </section>
      </div>
    </>
  );
};

export default ProposalTemplate;