exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { itens } = JSON.parse(event.body);

    if (!Array.isArray(itens) || itens.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nenhum item recebido.' })
      };
    }

    // Garante que cada item está no formato correto exigido pelo Mercado Pago
    const itemsFormatados = itens.map(item => ({
      title: String(item.title),
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity) || 1,
      currency_id: 'BRL'
    }));

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer APP_USR-7330322902043017-080718-80b7048a71c468f7934d39a113d106a0-301893319',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: itemsFormatados,
        back_urls: {
          success: 'https://genuine-marshmallow-75f48c.netlify.app/sucesso.html',
          failure: 'https://genuine-marshmallow-75f48c.netlify.app/erro.html',
          pending: 'https://genuine-marshmallow-75f48c.netlify.app/pendente.html'
        },
        auto_return: 'approved'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro retornado pelo Mercado Pago:', data);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Erro interno na function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
