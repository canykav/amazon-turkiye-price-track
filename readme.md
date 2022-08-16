# Amazon Türkiye Kategori Bazlı Fiyat Toplayıcı

Kodun içerisindeki kategori dizisine yazılan kategorilerin tüm sayfalarını web scraping yöntemiyle gezerek ürün adı, barkod, fiyat, link, ürün kodu verilerini toplayıp veritabanına kaydeder. 

API değildir. Amazon'daki tüm kategorileri gezme çılgınlığı yapıldığında Amazon yoğun trafiği algılayıp 'İşlem gerçekleştirilemedi' uyarılı sayfasına yönlendirir. 
Temel gıda veya bilgisayar parçaları gibi belli bir alana bağlı kalarak az sayıda kategori takip edildiğinde Amazon sistemine takılmaz.

![image](https://user-images.githubusercontent.com/40426722/184885501-f7780fa4-db9d-4bf3-8789-e4a4a2ba483f.png)

## Gerekenler
Node.js, MongoDB

## Kurulum

```bash
npm install
```
Komutunu çalıştırdıktan sonra MongoDB içinde trackings veritabanı ve içerisine amazon koleksiyonunu oluşturun.

## Kullanım
```
node amazon-track.js
```
Komutunu çalıştırıp işlemin bitmesini bekleyin.

## License
[MIT](https://choosealicense.com/licenses/mit/)

